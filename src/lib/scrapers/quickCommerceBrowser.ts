import type { Browser, BrowserContext, Page, JSHandle, ElementHandle } from 'puppeteer-core';
import { openGroceryBrowser } from './browserRuntime';
import type { DeliveryLocation, ProviderSearchResult, SourceStage, SourceState } from '@/types';
import { hasDeliveryLocation } from '@/lib/deliveryLocation';
import { groceryCardSelectors, parseGroceryCards, readGroceryCards } from './quickCommerceProducts';
import { findLocationTarget, groceryLocationSelectors, groceryPageState, type GroceryDomConfig, type LocationAction, type LocationTarget } from './quickCommerceDom';

type Platform = 'Blinkit' | 'Zepto';
type PageState = ReturnType<typeof groceryPageState>;
export class GrocerySourceError extends Error {
  constructor(readonly status: SourceState, readonly httpStatus?: number) { super(status); }
}
let activeBrowsers = 0;

function checkPage(state: PageState) {
  if (state.blocked) throw new GrocerySourceError('blocked');
  if (state.unserviceable) throw new GrocerySourceError('location_unavailable');
  if (state.storeUnavailable) throw new GrocerySourceError('store_unavailable');
}
async function waitForState(page: Page, config: GroceryDomConfig, predicate: (state: PageState) => boolean,
  timeout: number, failure: SourceState): Promise<PageState> {
  const until = Date.now() + timeout;
  do {
    const state = await page.evaluate(groceryPageState, config);
    if (state.blocked) throw new GrocerySourceError('blocked');
    if (predicate(state)) { checkPage(state); return state; }
    await new Promise(resolve => setTimeout(resolve, 150));
  } while (Date.now() < until);
  checkPage(await page.evaluate(groceryPageState, config));
  throw new GrocerySourceError(failure);
}

// Discover an element while polling; click/type only once, outside the polling callback.
async function locationAction(page: Page, config: GroceryDomConfig, action: LocationAction,
  location: DeliveryLocation, exclude: string[] = [], timeout = 7000) {
  const target = await page.waitForFunction(findLocationTarget, { timeout }, {
    ...config, action, pincode: location.pincode, gps: location.latitude !== undefined, exclude,
  }) as JSHandle<LocationTarget>;
  const kindHandle = await target.getProperty('kind');
  const elementHandle = await target.getProperty('element');
  try {
    const kind = await kindHandle.jsonValue();
    const element = elementHandle.asElement() as ElementHandle<HTMLElement> | null;
    if (!element) throw new GrocerySourceError('location_unavailable');
    if (kind === 'input') {
      await element.click({ clickCount: 3 });
      await element.press('Backspace');
      await element.type(location.pincode!);
    } else await element.click();
    return kind;
  } finally {
    await Promise.all([target.dispose(), kindHandle.dispose(), elementHandle.dispose()]);
  }
}
async function setDeliveryLocation(page: Page, config: GroceryDomConfig, location: DeliveryLocation, origin: string) {
  if (location.latitude !== undefined && location.longitude !== undefined) {
    await page.browserContext().overridePermissions(origin, ['geolocation']);
    await page.setGeolocation({ latitude: location.latitude, longitude: location.longitude, accuracy: 30 });
  }
  const used: string[] = [];
  let selected = false;
  for (let step = 0; step < 5; step++) {
    const kind = await locationAction(page, config, 'entry', location, used);
    if (kind === 'input') {
      await locationAction(page, config, 'suggestion', location);
      selected = true;
      break;
    }
    if (kind === 'gps') { selected = true; break; }
    used.push(kind);
    // Once inside an overlay, don't toggle the background header while its contents load.
    if (kind === 'continue' || kind === 'manual') used.push('header');
  }
  if (!selected) throw new GrocerySourceError('location_unavailable');
  let confirmed = false;
  const until = Date.now() + 10000;
  let stableLabel = '';
  let stableSince = Date.now();
  while (Date.now() < until) {
    const state = await page.evaluate(groceryPageState, config);
    if (state.blocked) throw new GrocerySourceError('blocked');
    if (state.locationLabel !== stableLabel || state.editing || state.locationPending) { stableLabel = state.locationLabel; stableSince = Date.now(); }
    // Address and store ETA update independently. Allow the selected store to finish updating.
    if (stableLabel && !state.editing && !state.locationPending && Date.now() - stableSince >= 750) { checkPage(state); return stableLabel; }
    if (!confirmed) {
      const candidate = await page.evaluateHandle(findLocationTarget, { ...config, action: 'confirm' as const }) as JSHandle<LocationTarget | null>;
      const hasConfirm = await candidate.evaluate(value => Boolean(value));
      await candidate.dispose();
      if (hasConfirm) {
        await locationAction(page, config, 'confirm', location);
        confirmed = true;
      }
    }
    await new Promise(resolve => setTimeout(resolve, 150));
  }
  checkPage(await page.evaluate(groceryPageState, config));
  throw new GrocerySourceError('location_unavailable');
}
async function navigate(page: Page, url: string) {
  const response = await page.goto(url, { waitUntil: 'domcontentloaded' });
  const status = response?.status();
  if ([401, 403, 429].includes(status ?? 0) || response?.headers()['x-amzn-waf-action'] === 'challenge') {
    throw new GrocerySourceError('blocked', status);
  }
  if (!response || (status ?? 0) >= 400) throw new GrocerySourceError('unavailable', status);
}

// DOM integration tests exercise the same flow used in production.
export async function retrieveGroceryPage(page: Page, platform: Platform, query: string, location: DeliveryLocation,
  stage: (value: SourceStage) => void = () => {}) {
  const config = { ...groceryLocationSelectors, cards: groceryCardSelectors[platform] };
  const origin = platform === 'Blinkit' ? 'https://blinkit.com' : 'https://www.zepto.com';
  stage('storefront');
  await navigate(page, origin);
  stage('location');
  let committedLocation: string;
  try { committedLocation = await setDeliveryLocation(page, config, location, origin); }
  catch (error) {
    if (error instanceof GrocerySourceError) throw error;
    checkPage(await page.evaluate(groceryPageState, config));
    throw new GrocerySourceError('location_unavailable');
  }
  stage('search');
  const searchUrl = platform === 'Blinkit' ? origin + '/s/?q=' + encodeURIComponent(query) : origin + '/search?query=' + encodeURIComponent(query);
  await navigate(page, searchUrl);
  const state = await waitForState(page, { ...config, query }, current => current.blocked || current.storeUnavailable ||
    current.unserviceable || current.empty || (current.cardsReady && current.queryConfirmed), 10000, 'parse_error');
  if (state.editing || state.locationPending || (state.locationLabel && state.locationLabel !== committedLocation)) throw new GrocerySourceError('location_unavailable');
  stage('parse');
  const products = state.empty ? [] : parseGroceryCards(platform, readGroceryCards(platform, await page.content()));
  if (!state.empty && !products.length) throw new GrocerySourceError('parse_error');
  stage('verify_location');
  if (!state.locationLabel) {
    // Blinkit's search layout removes the location header. Verify the same isolated session
    // on its home page after reading cards; never accept an unconfirmed default city.
    await navigate(page, origin);
    await waitForState(page, config, current => Boolean(current.locationLabel), 7000, 'location_unavailable');
    const verified = await page.evaluate(groceryPageState, config);
    if (verified.editing || verified.locationPending || verified.locationLabel !== committedLocation) throw new GrocerySourceError('location_unavailable');
  }
  return products;
}
export async function scrapeQuickCommerce(platform: Platform, query: string, location: DeliveryLocation): Promise<ProviderSearchResult> {
  const started = Date.now();
  let stage: SourceStage = 'browser';
  const result = (status: SourceState, products: ProviderSearchResult['products'] = [], httpStatus?: number): ProviderSearchResult => ({
    products, source: { platform, status, stage, ...(httpStatus ? { httpStatus } : {}),
      receivedCount: products.length, matchedCount: 0, durationMs: Date.now() - started },
  });
  if (!hasDeliveryLocation(location)) { stage = 'location'; return result('location_required'); }
  const endpoint = process.env.QUICK_COMMERCE_BROWSER_WS_ENDPOINT;
  if (activeBrowsers >= 2) return result('busy');
  activeBrowsers++;
  let browser: Browser | undefined;
  let context: BrowserContext | undefined;
  let expired = false;
  let release: Promise<void> | undefined;
  const releaseBrowser = () => {
    if (!browser) return Promise.resolve();
    release ??= endpoint ? Promise.resolve(browser.disconnect()) : browser.close().catch(() => {});
    return release;
  };
  let timer: ReturnType<typeof setTimeout> | undefined;
  const deadline = new Promise<never>((_, reject) => {
    timer = setTimeout(() => { expired = true; reject(new GrocerySourceError('timeout')); }, 45000);
  });
  const operation = async () => {
    try {
      browser = await openGroceryBrowser({ endpoint, vercel: Boolean(process.env.VERCEL),
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH });
    } catch { throw new GrocerySourceError('browser_unavailable'); }
    if (expired) { await releaseBrowser(); throw new GrocerySourceError('timeout'); }
    context = await browser.createBrowserContext();
    if (expired) { await context.close().catch(() => {}); throw new GrocerySourceError('timeout'); }
    const page = await context.newPage();
    page.setDefaultTimeout(7000);
    page.setDefaultNavigationTimeout(10000);
    await page.setViewport({ width: 1280, height: 900 });
    const products = await retrieveGroceryPage(page, platform, query, location, value => { if (!expired) stage = value; });
    return result(products.length ? 'success' : 'empty', products);
  };
  try { return await Promise.race([operation(), deadline]); }
  catch (error) {
    const status = error instanceof GrocerySourceError ? error.status : error instanceof Error && error.name === 'TimeoutError' ? 'timeout' : 'unavailable';
    console.warn('[' + platform + '] ' + stage + ': ' + status);
    return result(status, [], error instanceof GrocerySourceError ? error.httpStatus : undefined);
  } finally {
    if (timer) clearTimeout(timer);
    const cleanup = (async () => { await context?.close().catch(() => {}); await releaseBrowser(); })();
    let cleanupTimer: ReturnType<typeof setTimeout> | undefined;
    await Promise.race([cleanup, new Promise<void>(resolve => { cleanupTimer = setTimeout(resolve, 1500); })]);
    if (cleanupTimer) clearTimeout(cleanupTimer);
    // Hold capacity until cleanup actually finishes, even if the response has returned.
    void cleanup.finally(() => { activeBrowsers--; });
  }
}
