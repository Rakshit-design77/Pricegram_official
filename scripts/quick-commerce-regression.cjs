const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { test } = require('node:test');
const ts = require('typescript');
const { parseHTML } = require('linkedom');
const root = path.resolve(__dirname, '..');

function loader(mocks = {}) {
  const cache = new Map();
  function load(file) {
    if (cache.has(file)) return cache.get(file).exports;
    const mod = { exports: {} };
    cache.set(file, mod);
    const js = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true, jsx: ts.JsxEmit.ReactJSX },
    }).outputText;
    const resolve = id => {
      if (Object.hasOwn(mocks, id)) return mocks[id].default ? { ...mocks[id], __esModule: true } : mocks[id];
      if (id.startsWith('@/')) return load(path.join(root, 'src', id.slice(2)) + '.ts');
      if (id.startsWith('.')) return load(path.resolve(path.dirname(file), id) + '.ts');
      return require(id);
    };
    new Function('require', 'exports', 'console', js)(resolve, mod.exports, { info() {}, warn() {}, log() {}, error() {} });
    return mod.exports;
  }
  return relative => load(path.join(root, relative));
}
const load = loader();
const { parseGroceryCards: parse, readGroceryCards: read } = load('src/lib/scrapers/quickCommerceProducts.ts');
const { locationFromParams, appendDeliveryLocation, hasDeliveryLocation } = load('src/lib/deliveryLocation.ts');
const { savedDeliveryLocation } = load('src/lib/deliveryLocation.ts');
const card = overrides => ({ title: 'Amul Toned Milk', unit: '500 ml', priceText: '₹29.50',
  url: 'https://blinkit.com/prn/amul-milk/prid/19512', ...overrides });
const fixtures = Object.fromEntries(['Blinkit', 'Zepto'].map(platform => [platform,
  fs.readFileSync(path.join(__dirname, 'fixtures', platform.toLowerCase() + '-current.html'), 'utf8')]));
const dom = load('src/lib/scrapers/quickCommerceDom.ts');
const domConfig = platform => ({ ...dom.groceryLocationSelectors,
  cards: load('src/lib/scrapers/quickCommerceProducts.ts').groceryCardSelectors[platform], query: 'toned milk' });

// Execute the real browser callbacks against a DOM, rather than stubbing every selector as successful.
function domPage({ platform = 'Blinkit', status = 200, searchStatus = 200, locationFails = false,
  navigationFails = false, lostLocation = false, storeClosed = false, searchBlocked = false,
  blank = false, confirmLocation = false, delayedConfirmation = false } = {}) {
  const events = [];
  const window = parseHTML('<html><body></body></html>');
  const document = window.document;
  window.HTMLElement.prototype.getClientRects = function () { return this.closest('[hidden]') ? [] : [{}]; };
  const run = (fn, arg) => new Function('document', 'getComputedStyle', 'arg', 'return (' + fn.toString() + ')(arg)')(
    document, () => ({ visibility: 'visible' }), arg);
  const label = platform === 'Blinkit' ? 'Noida, Uttar Pradesh 201310, India' : 'Pocket B - Pocket B, Greater Noida, Uttar Pradesh';
  const header = value => platform === 'Blinkit' ? '<div class="LocationBar__Subtitle-sc-x8ezho-10">' + value + '</div>' :
    '<button><h3 data-testid="user-address">' + value + '</h3></button>';
  let selected = false;
  let visits = 0;
  let pendingConfirm = false;
  let reads = 0;
  const setBody = html => { document.body.innerHTML = html; };
  const input = '<input placeholder="Search a new address">';
  const commit = () => { selected = true; setBody(header(label) + (storeClosed ? '<h2>Store Under Maintenance</h2>' : '<h2>13 minutes</h2>')); };
  const handle = value => ({
    async getProperty(key) { return handle(value?.[key]); },
    async jsonValue() { return value; }, async evaluate(fn) { return fn(value); }, async dispose() {},
    asElement() { return value?.nodeType === 1 ? {
      async click() {
        const text = value.innerText.trim(); events.push('click:' + text);
        if (text === 'Continue on web') setBody(header('Select Location') + '<div role="dialog"><div>Select manually</div></div>');
        else if (text === 'Select manually' || text === 'Select Location') setBody(header('Select Location') + '<div role="dialog">' + input + '</div>');
        else if (value.matches(dom.groceryLocationSelectors.suggestion) || /use my current location/i.test(text)) {
          if (confirmLocation) { pendingConfirm = true; setBody(header('Select Location') + '<div role="dialog">Confirm your area</div>'); }
          else commit();
        } else if (text === 'Confirm Location') commit();
      },
      async press() { value.value = ''; },
      async type(text) {
        events.push('type:' + text); value.value = text;
        if (!locationFails) {
          const suggestion = platform === 'Blinkit' ?
            '<div class="LocationSearchList__LocationDetailContainer-sc-93rfr7-1"><div class="LocationSearchList__LocationLabel-sc-93rfr7-2">Noida</div><div class="LocationSearchList__LocationDetails-sc-93rfr7-3">Uttar Pradesh ' + text + ', India</div></div>' :
            '<div data-testid="address-search-item"><div>Noida</div><span>Noida, Uttar Pradesh ' + text + ', India</span></div>';
          document.querySelector('[role="dialog"]').insertAdjacentHTML('beforeend', suggestion);
        }
      },
    } : null; },
  });
  const page = {
    events, document, run,
    setDefaultTimeout() {}, setDefaultNavigationTimeout() {}, async setViewport() {},
    browserContext() { return { async overridePermissions() {} }; }, async setGeolocation() {},
    async goto(url) {
      events.push(url);
      if (navigationFails) { const e = new Error('navigation timeout'); e.name = 'TimeoutError'; throw e; }
      const search = url.includes('/s/?') || url.includes('/search?');
      if (search) setBody((platform === 'Zepto' ? header(label) : '') + (searchBlocked ? '<h1>Verify you are human</h1>' :
        blank ? '<h1>No products found</h1>' : fixtures[platform].replace('Showing results for "toned milk"',
          'Showing results for "' + (new URL(url).searchParams.get('q') || new URL(url).searchParams.get('query')) + '"')));
      else {
        visits++;
        setBody(header(visits > 1 && lostLocation ? 'Another delivery area' : selected ? label : 'Select Location') +
          (!selected && platform === 'Blinkit' ? '<div role="dialog"><div>Continue on web</div></div>' : ''));
      }
      return { status: () => search ? searchStatus : status, headers: () => ({}) };
    },
    async evaluate(fn, arg) {
      if (pendingConfirm && (!delayedConfirmation || ++reads >= 3)) {
        pendingConfirm = false;
        document.querySelector('[role="dialog"]').insertAdjacentHTML('beforeend', '<button>Confirm Location</button>');
      }
      return run(fn, arg);
    },
    async evaluateHandle(fn, arg) { return handle(run(fn, arg)); },
    async waitForFunction(fn, options, arg) {
      const value = run(fn, arg);
      if (!value) { const e = new Error('No matching DOM target'); e.name = 'TimeoutError'; throw e; }
      return handle(value);
    },
    async content() { return document.body.innerHTML; },
  };
  return page;
}

test('preserves decimal rupees and pack size without inventing MRP, reviews or delivery terms', () => {
  const [product] = parse('Blinkit', [card()]);
  assert.equal(product.price, 29.5);
  assert.equal(product.mrp, 29.5);
  assert.equal(product.discount, 0);
  assert.equal(product.title, 'Amul Toned Milk 500 ml');
  assert.equal(product.rating, undefined);
  assert.equal(product.stockStatus, 'Unknown');
  assert.equal(product.deliveryFeeKnown, false);
  assert.equal(product.deliveryTime, 'Check at checkout');
});

test('uses only stated stock/MRP and rejects wrong-store, missing-product and unsafe links', () => {
  const [product] = parse('Blinkit', [card({ priceText: '₹50.50', mrpText: '₹100', inStock: false })]);
  assert.equal(product.discount, 50);
  assert.equal(product.stockStatus, 'Out of stock');
  for (const url of ['https://blinkit.com/', 'https://evilblinkit.com/prid/123', 'javascript:alert(1)', 'https://www.zepto.com/pn/milk/pvid/id']) {
    assert.deepEqual(parse('Blinkit', [card({ url })]), []);
  }
  assert.deepEqual(parse('Blinkit', [card({ priceText: 'unavailable' })]), []);
});

test('extracts Blinkit card fixtures including product IDs, quantities and decimal prices', () => {
  const html = '<div role="button" id="19512"><div class="Product__UpdatedTitle-sc-test">Amul Toned Milk</div><div class="Product__UpdatedDesc-sc-test">500 ml</div><span>₹29.50</span><del>₹32</del><button>ADD</button><img src="https://example.com/milk.jpg"/></div>';
  const [product] = parse('Blinkit', read('Blinkit', html));
  assert.equal(product.price, 29.5);
  assert.equal(product.mrp, 32);
  assert.match(product.url, /\/prid\/19512$/);
  assert.equal(product.stockStatus, 'In stock');
});

test('extracts Zepto card fixtures and keeps product links instead of a homepage fallback', () => {
  const html = '<a data-testid="product-card" href="/pn/mother-dairy-milk/pvid/sku-500"><h5>Mother Dairy Toned Milk</h5><span data-testid="product-card-quantity">500 ml</span><span data-testid="product-card-price">₹30</span><span data-testid="product-card-mrp">₹32</span><span>Sold out</span></a>';
  const [product] = parse('Zepto', read('Zepto', html));
  assert.equal(product.platform, 'Zepto');
  assert.equal(product.price, 30);
  assert.equal(product.url, 'https://www.zepto.com/pn/mother-dairy-milk/pvid/sku-500');
  assert.equal(product.stockStatus, 'Out of stock');
  assert.deepEqual(parse('Zepto', [card({ url: 'https://www.zepto.com/' })]), []);
});

test('validates location input and never substitutes a default pincode', () => {
  assert.deepEqual(locationFromParams(new URLSearchParams()), {});
  assert.deepEqual(locationFromParams(new URLSearchParams('pincode=201310')), { pincode: '201310' });
  assert.deepEqual(locationFromParams(new URLSearchParams('lat=28.47&lon=77.51')), { latitude: 28.47, longitude: 77.51 });
  for (const query of ['pincode=000000', 'pincode=20131', 'lat=28', 'lon=77', 'lat=&lon=', 'lat=NaN&lon=77', 'lat=91&lon=77']) {
    assert.throws(() => locationFromParams(new URLSearchParams(query)));
  }
});

test('forwards real coordinates, or the selected pincode including old saved labels', () => {
  const params = new URLSearchParams();
  appendDeliveryLocation(params, 'Noida, 201310', null);
  assert.equal(params.get('pincode'), '201310');
  const gps = new URLSearchParams();
  appendDeliveryLocation(gps, 'Current location', { latitude: 28.47, longitude: 77.51 });
  assert.equal(gps.get('lat'), '28.47');
  assert.equal(gps.get('lon'), '77.51');
  assert.equal(gps.has('pincode'), false);
});

test('location changes remove previous coordinates and reject invalid direct adapter locations', () => {
  const params = new URLSearchParams('lat=28&lon=77&pincode=201310');
  appendDeliveryLocation(params, '201301', null);
  assert.equal(params.toString(), 'pincode=201301');
  appendDeliveryLocation(params, 'Current location', { latitude: 0, longitude: 0 });
  assert.equal(params.toString(), 'lat=0&lon=0');
  appendDeliveryLocation(params, '', null);
  assert.equal(params.toString(), '');
  for (const location of [{}, { pincode: '000000' }, { latitude: NaN, longitude: 77 },
    { latitude: 91, longitude: 77 }, { latitude: 28 }, { latitude: 28, longitude: Infinity }]) {
    assert.equal(hasDeliveryLocation(location), false);
  }
});

test('first visit and invalid saved preferences require location; valid pincode and GPS restore correctly', () => {
  assert.equal(hasDeliveryLocation(savedDeliveryLocation('', null)), false);
  assert.equal(hasDeliveryLocation(savedDeliveryLocation('Current location', { latitude: NaN, longitude: 77 })), false);
  assert.deepEqual(savedDeliveryLocation('Noida, 201301', null), { pincode: '201301' });
  assert.deepEqual(savedDeliveryLocation('Current location', { latitude: 28.47, longitude: 77.51 }), { latitude: 28.47, longitude: 77.51 });
});

test('hydration gate waits for saved location and remains usable when persistence is unavailable', () => {
  let hydrated = false;
  let state = { location: '201301', locationCoordinates: null };
  const store = selector => selector(state);
  store.persist = { hasHydrated: () => hydrated };
  const hook = loader({ react: { useSyncExternalStore: (_subscribe, snapshot) => snapshot() },
    '@/store/useStore': { useStore: store } })('src/hooks/useDeliveryLocation.ts').useDeliveryLocation;
  assert.deepEqual(hook(), { hydrated: false, ready: false });
  hydrated = true;
  assert.equal(hook().ready, true);
  state = { location: '', locationCoordinates: null };
  assert.equal(hook().ready, false);
  delete store.persist;
  state = { location: '201301', locationCoordinates: null };
  assert.equal(hook().ready, true);
});

test('site header automatically opens a required picker only after hydration when no location is chosen', () => {
  const React = require('react');
  const { renderToStaticMarkup } = require('react-dom/server');
  const component = ({ children }) => React.createElement(React.Fragment, null, children);
  const components = names => Object.fromEntries(names.split(' ').map(name => [name, component]));
  let delivery = { hydrated: false, ready: false };
  let picker;
  const Navbar = loader({
    'next/link': { default: component },
    'next/navigation': { useRouter: () => ({ push() {} }) },
    'lucide-react': components('Search MapPin Menu User LogIn Sparkles ShoppingCart'),
    '@/components/ui/input': components('Input'), '@/components/ui/button': components('Button'),
    '@/components/ui/switch': components('Switch'), '@/components/ui/sheet': components('Sheet SheetContent SheetTrigger'),
    '@clerk/nextjs': components('SignInButton SignUpButton UserButton SignedIn SignedOut'),
    '@/store/useStore': { useStore: () => ({ location: '', setLocation() {}, setDetectedLocation() {} }) },
    '@/store/cartStore': { useCartStore: selector => selector({ items: [], setIsCartOpen() {} }) },
    '@/hooks/useDeliveryLocation': { useDeliveryLocation: () => delivery },
    '@/components/location/LocationModal': { LocationModal: props => { picker = props; return null; } },
  })('src/components/layout/Navbar.tsx').Navbar;
  renderToStaticMarkup(React.createElement(Navbar));
  assert.equal(picker.isOpen, false);
  delivery = { hydrated: true, ready: false };
  renderToStaticMarkup(React.createElement(Navbar));
  assert.equal(picker.isOpen, true);
  assert.equal(picker.required, true);
  delivery = { hydrated: true, ready: true };
  renderToStaticMarkup(React.createElement(Navbar));
  assert.equal(picker.isOpen, false);
  assert.equal(picker.required, false);
});

test('grocery cards extract lazy product photos and ignore ETA icons instead of using store-search links', () => {
  const html = '<div role="button" id="123"><h3>Frooti Mango Drink</h3><span>₹10</span>' +
    '<img src="https://cdn.grofers.com/assets/eta-icons/15-mins.png"><img src="data:image/gif;base64,AA" data-src="https://cdn.grofers.com/products/frooti.jpg"></div>';
  const [product] = parse('Blinkit', read('Blinkit', html));
  assert.equal(product.image, 'https://cdn.grofers.com/products/frooti.jpg');
  assert.equal(product.title, 'Frooti Mango Drink');
  assert.match(product.url, /\/prid\/123$/);
});

test('Frooti and milk bypass general web-search fallback while retaining direct merchant products', async t => {
  const originalFetch = global.fetch;
  const key = process.env.VALUESERP_API_KEY;
  process.env.VALUESERP_API_KEY = 'test-only';
  t.after(() => { global.fetch = originalFetch; if (key === undefined) delete process.env.VALUESERP_API_KEY; else process.env.VALUESERP_API_KEY = key; });
  const calls = [];
  global.fetch = async url => {
    calls.push(String(url));
    const title = String(url).includes('milk') ? 'Amul Toned Milk' : 'Frooti Mango Drink';
    return { status: 200, text: async () => String(url).includes('amazon.in') ?
      '<div class="s-result-item" data-component-type="s-search-result"><h2><span>' + title + '</span></h2><span class="a-price-whole">10</span><img class="s-image" src="https://images.example.com/product.jpg"><a class="a-link-normal" href="/dp/PRODUCT123">Buy</a></div>' : '<html></html>' };
  };
  const marketplace = load('src/lib/scrapers/valueserp.ts');
  for (const query of ['Frooti', 'frooti mango drink', 'milk']) {
    const result = await marketplace.fetchValueSerpResults(query);
    assert.equal(result.success, true);
    assert.equal(result.products[0].image, 'https://images.example.com/product.jpg');
    assert.equal(result.products[0].platform, 'Amazon');
  }
  assert.equal(calls.filter(url => url.includes('amazon.in')).length, 3);
  assert.equal(calls.filter(url => url.includes('flipkart.com')).length, 3);
  assert.equal(calls.some(url => url.includes('scaleserp.com')), false);
});

test('store requires a chosen location and manual selection supersedes GPS; legacy default is reconfirmed', () => {
  let state;
  let persistence;
  const store = loader({
    zustand: { create: () => initialize => { state = initialize(update => { state = { ...state, ...update }; }); return { getState: () => state }; } },
    'zustand/middleware': { persist: (initialize, options) => { persistence = options; return initialize; } },
  })('src/store/useStore.ts').useStore;
  assert.equal(store.getState().location, '');
  store.getState().setDetectedLocation({ latitude: 28.47, longitude: 77.51 });
  assert.equal(store.getState().location, 'Current location');
  store.getState().setLocation('201301');
  assert.equal(store.getState().locationCoordinates, null);
  store.getState().setDetectedLocation({ latitude: NaN, longitude: 77 });
  store.getState().setLocation('000000');
  assert.equal(store.getState().location, '201301');
  assert.equal(persistence.migrate({ location: '201310', wishlist: ['keep'] }).location, '');
  assert.deepEqual(persistence.migrate({ location: '201310', wishlist: ['keep'] }).wishlist, ['keep']);
  assert.equal(persistence.migrate({ location: '201301' }).location, '201301');
});

function provider(platform, products = [], status = 'success') {
  return { products, source: { platform, status, receivedCount: products.length, matchedCount: 0, durationMs: 0 } };
}
function searchWithMocks(browser, marketplace = async () => ({ success: true, products: [] })) {
  return loader({ './quickCommerceBrowser': { scrapeQuickCommerce: browser },
    './scrapers/valueserp': { fetchValueSerpResults: marketplace } })('src/lib/productSearch.ts').searchProducts;
}

test('both real adapter wrappers receive the original query and selected location', async () => {
  const calls = [];
  const location = { pincode: '201310' };
  const search = searchWithMocks(async (platform, query, receivedLocation) => {
    calls.push({ platform, query, location: receivedLocation });
    return provider(platform, parse(platform, [card({ url: platform === 'Blinkit' ? card().url : 'https://www.zepto.com/pn/milk/pvid/sku-500', inStock: true })]));
  });
  const result = await search('milk', { location, platforms: [] });
  assert.equal(result.products.length, 2);
  assert.deepEqual(calls, [{ platform: 'Blinkit', query: 'milk', location }, { platform: 'Zepto', query: 'milk', location }]);
});

test('a Blinkit-only filter triggers Blinkit, without fetching other merchants', async () => {
  const calls = [];
  const search = searchWithMocks(async platform => { calls.push(platform); return provider(platform, [], 'empty'); },
    async () => { throw new Error('Marketplace must not be called'); });
  const result = await search('milk', { location: { pincode: '201310' }, platforms: ['Blinkit'] });
  assert.deepEqual(calls, ['Blinkit']);
  assert.deepEqual(result.sources.map(source => source.platform), ['Blinkit']);
});

test('one failed platform does not discard other source results; unrelated milk is filtered', async () => {
  const dairy = parse('Zepto', [card({ url: 'https://www.zepto.com/pn/milk/pvid/sku-500' })])[0];
  const search = searchWithMocks(async platform => {
    if (platform === 'Blinkit') throw new Error('network failure');
    return provider(platform, [dairy, { ...dairy, title: 'Green Magic Coconut Milk' }]);
  }, async () => { throw new Error('other network failure'); });
  const result = await search('toned milk', { location: { pincode: '201310' }, platforms: [] });
  assert.equal(result.products.length, 1);
  assert.equal(result.sources.find(source => source.platform === 'Zepto').matchedCount, 1);
  assert.equal(result.sources.find(source => source.platform === 'Blinkit').status, 'unavailable');
});

test('search-engine snippets cannot impersonate live Blinkit/Zepto inventory', async () => {
  const cached = parse('Blinkit', [card()])[0];
  const search = searchWithMocks(async platform => provider(platform, [], 'browser_unavailable'),
    async () => ({ success: true, products: [cached] }));
  const result = await search('milk', { location: { pincode: '201310' }, platforms: [] });
  assert.deepEqual(result.products, []);
  assert.equal(result.sources.find(source => source.platform === 'Blinkit').status, 'browser_unavailable');
});

function mockBrowser(scenario = {}) {
  const page = domPage(scenario);
  const events = page.events;
  const context = { async newPage() { return page; }, async close() { events.push('context-closed'); } };
  const browser = { async createBrowserContext() { return context; }, async close() { events.push('browser-closed'); }, disconnect() { events.push('disconnected'); } };
  return { events, puppeteer: { default: { async connect() { return browser; }, async launch() { return browser; } } } };
}
test('missing location avoids launching or connecting to a browser', async () => {
  const { scrapeQuickCommerce } = loader({ 'puppeteer-core': { default: {} } })('src/lib/scrapers/quickCommerceBrowser.ts');
  const result = await scrapeQuickCommerce('Blinkit', 'milk', {});
  assert.equal(result.source.status, 'location_required');
});

test('a failed Vercel runtime reports browser failure, not zero stock', async t => {
  const previous = { VERCEL: process.env.VERCEL, endpoint: process.env.QUICK_COMMERCE_BROWSER_WS_ENDPOINT };
  process.env.VERCEL = '1'; delete process.env.QUICK_COMMERCE_BROWSER_WS_ENDPOINT;
  t.after(() => { if (previous.VERCEL === undefined) delete process.env.VERCEL; else process.env.VERCEL = previous.VERCEL;
    if (previous.endpoint === undefined) delete process.env.QUICK_COMMERCE_BROWSER_WS_ENDPOINT; else process.env.QUICK_COMMERCE_BROWSER_WS_ENDPOINT = previous.endpoint; });
  const { scrapeQuickCommerce } = loader({ './browserRuntime': { openGroceryBrowser: async () => { throw new Error('Runtime failure'); } } })('src/lib/scrapers/quickCommerceBrowser.ts');
  assert.equal((await scrapeQuickCommerce('Zepto', 'milk', { pincode: '201310' })).source.status, 'browser_unavailable');
});

for (const scenario of [{ name: 'blocked', status: 403, expected: 'blocked' },
  { name: 'location fails', locationFails: true, expected: 'location_unavailable' },
  { name: 'navigation timeout', navigationFails: true, expected: 'timeout' },
  { name: 'parsed fixture', expected: 'success' }]) {
  test(`browser lifecycle: ${scenario.name}; closes isolated context and disconnects without killing the hosted browser`, async t => {
    const previous = process.env.QUICK_COMMERCE_BROWSER_WS_ENDPOINT;
    process.env.QUICK_COMMERCE_BROWSER_WS_ENDPOINT = 'wss://example.com/browser?token=private';
    t.after(() => { if (previous === undefined) delete process.env.QUICK_COMMERCE_BROWSER_WS_ENDPOINT; else process.env.QUICK_COMMERCE_BROWSER_WS_ENDPOINT = previous; });
    const mock = mockBrowser(scenario);
    const { scrapeQuickCommerce } = loader({ 'puppeteer-core': mock.puppeteer })('src/lib/scrapers/quickCommerceBrowser.ts');
    const result = await scrapeQuickCommerce('Blinkit', 'milk', { pincode: '201310' });
    assert.equal(result.source.status, scenario.expected);
    assert.ok(mock.events.includes('context-closed'));
    assert.ok(mock.events.includes('disconnected'));
    assert.ok(!mock.events.includes('browser-closed'));
    assert.ok(!JSON.stringify(result).includes('private'));
    if (scenario.locationFails) assert.ok(!mock.events.some(event => event.includes('/s/?q=')));
  });
}

test('Vercel runtime uses bundled Linux Chromium with one shared extraction and isolated-context-compatible arguments', async () => {
  let extractions = 0;
  const launches = [];
  const { openGroceryBrowser } = loader({
    'puppeteer-core': { default: { async launch(options) { launches.push(options); return {}; } } },
    '@sparticuz/chromium': { default: { args: ['--single-process', '--disable-gpu'],
      async executablePath() { extractions++; return '/tmp/chromium'; } } },
  })('src/lib/scrapers/browserRuntime.ts');
  await Promise.all([openGroceryBrowser({ vercel: true, platform: 'linux' }), openGroceryBrowser({ vercel: true, platform: 'linux' })]);
  assert.equal(extractions, 1);
  assert.equal(launches.length, 2);
  assert.ok(launches.every(options => options.executablePath === '/tmp/chromium' && options.headless === 'shell'));
  assert.ok(launches.every(options => !options.args.includes('--single-process')));
});

test('runtime supports local Chrome and optional hosted browser, with no hardcoded credential', async () => {
  const launches = [];
  const connections = [];
  const { openGroceryBrowser } = loader({ 'puppeteer-core': { default: {
    async launch(options) { launches.push(options); return {}; },
    async connect(options) { connections.push(options); return {}; },
  } } })('src/lib/scrapers/browserRuntime.ts');
  await openGroceryBrowser({ vercel: false, executablePath: 'C:/Chrome/chrome.exe' });
  assert.equal(launches[0].executablePath, 'C:/Chrome/chrome.exe');
  await openGroceryBrowser({ vercel: true, endpoint: 'wss://example.com/browser' });
  assert.equal(connections[0].browserWSEndpoint, 'wss://example.com/browser');
  await assert.rejects(openGroceryBrowser({ vercel: true, endpoint: 'https://example.com/' }));
});


test('parses the observed current Blinkit DOM, including nested pack size and strikethrough MRP', () => {
  const products = parse('Blinkit', read('Blinkit', fixtures.Blinkit));
  assert.equal(products.length, 2);
  assert.equal(products[0].title, 'Amul Taaza Toned Milk 500 ml');
  assert.equal(products[0].price, 30);
  assert.equal(products[0].stockStatus, 'In stock');
  assert.equal(products[1].price, 57);
  assert.equal(products[1].mrp, 60);
  assert.equal(products[1].discount, 5);
});

test('parses observed Zepto ProductName, PackSize and EdlpPrice without treating MRP as the selling price', () => {
  const [product] = parse('Zepto', read('Zepto', fixtures.Zepto));
  assert.equal(product.title, 'Amul Taaza Toned Fresh Milk | Pouch 1 pack (500 ml)');
  assert.equal(product.price, 23);
  assert.equal(product.mrp, 30);
  assert.equal(product.stockStatus, 'In stock');
  assert.match(product.url, /9d447ba5-1d35-46e1-bc64-e932135d026f$/);
});

test('explicit out-of-stock and disabled ADD override catalogue button text', () => {
  const soldOut = fixtures.Zepto.replace('data-is-out-of-stock="false"', 'data-is-out-of-stock="true"');
  assert.equal(parse('Zepto', read('Zepto', soldOut))[0].stockStatus, 'Out of stock');
  const disabled = fixtures.Zepto.replace('<button data-mode=', '<button disabled data-mode=');
  assert.equal(parse('Zepto', read('Zepto', disabled))[0].stockStatus, 'Unknown');
});

test('MRP appearing before the price is never used as the selling price', () => {
  const html = '<div role="button" id="12"><h3>Amul Milk</h3><div class="tw-line-through"><span>₹60</span></div><span>₹57</span></div>';
  assert.equal(parse('Blinkit', read('Blinkit', html))[0].price, 57);
});

test('Blinkit chooses a full suggestion row in source order, not the shortest nested pincode label', () => {
  const page = domPage();
  page.document.body.innerHTML = '<div class="LocationSearchList__LocationDetailContainer-sc-test"><div>Noida</div><div class="LocationSearchList__LocationDetails-sc-test">Uttar Pradesh 201310, India</div></div>' +
    '<div class="LocationSearchList__LocationDetailContainer-sc-test"><div class="LocationSearchList__LocationLabel-sc-test">201310</div><div>Another part of Greater Noida</div></div>';
  const target = page.run(dom.findLocationTarget, { ...domConfig('Blinkit'), action: 'suggestion', pincode: '201310' });
  assert.match(target.element.innerText, /^Noida/);
  assert.ok(target.element.matches('[class*="LocationDetailContainer"]'));
  assert.equal(page.run(dom.findLocationTarget, { ...domConfig('Blinkit'), action: 'suggestion', pincode: '201301' }), null);
});

test('Zepto uses address-search-item; suggestions without the requested postcode are rejected', () => {
  const page = domPage({ platform: 'Zepto' });
  page.document.body.innerHTML = '<div data-testid="address-search-item">Noida, Uttar Pradesh 201310, India</div>';
  assert.ok(page.run(dom.findLocationTarget, { ...domConfig('Zepto'), action: 'suggestion', pincode: '201310' }));
  assert.equal(page.run(dom.findLocationTarget, { ...domConfig('Zepto'), action: 'suggestion', pincode: '201301' }), null);
});

test('entry flow supports generic div controls, skips hidden controls and never clicks ADD', () => {
  const page = domPage();
  page.document.body.innerHTML = '<div hidden><div>Continue on web</div></div><button>ADD</button><div>Select manually</div>';
  const target = page.run(dom.findLocationTarget, { ...domConfig('Blinkit'), action: 'entry' });
  assert.equal(target.kind, 'manual');
  assert.equal(page.run(dom.findLocationTarget, { ...domConfig('Blinkit'), action: 'entry', exclude: ['manual'] }), null);
});

test('a stale/default product grid is not ready until its heading matches the actual query', () => {
  const page = domPage();
  page.document.body.innerHTML = fixtures.Blinkit.replace('Showing results for "toned milk"', 'Showing results for "bread"');
  const state = page.run(dom.groceryPageState, domConfig('Blinkit'));
  assert.equal(state.cardsReady, true);
  assert.equal(state.queryConfirmed, false);
});

test('a visible address header is not committed while a detection or confirmation dialog remains open', () => {
  const page = domPage();
  for (const text of ['Detecting your location...', 'Confirm your area', 'Select your Location']) {
    page.document.body.innerHTML = '<div class="LocationBar__Subtitle-sc-test">Previous area</div><div role="dialog">' + text + '</div>';
    const state = page.run(dom.groceryPageState, domConfig('Blinkit'));
    assert.equal(state.locationLabel, 'Previous area');
    assert.equal(state.locationPending, true);
  }
});

test('GPS selection supports current storefront wording without falling back to a pincode', () => {
  const page = domPage();
  page.document.body.innerHTML = '<div>Use My Current Location</div><div>Select manually</div>';
  assert.equal(page.run(dom.findLocationTarget, { ...domConfig('Zepto'), action: 'entry', gps: true }).kind, 'gps');
});

test('store maintenance, no delivery, human verification and genuine empty states remain distinct', () => {
  const page = domPage();
  for (const [text, key] of [['Store Under Maintenance', 'storeUnavailable'], ['We don’t deliver here', 'unserviceable'],
    ['Verify you are human', 'blocked'], ['No products found', 'empty']]) {
    page.document.body.innerHTML = '<h2>' + text + '</h2>';
    const state = page.run(dom.groceryPageState, domConfig('Blinkit'));
    assert.equal(state[key], true);
    if (key !== 'empty') assert.equal(state.empty, false);
  }
});

const retrieve = load('src/lib/scrapers/quickCommerceBrowser.ts').retrieveGroceryPage;

test('production Blinkit flow handles app prompt, manual search, current DOM and missing search header', async () => {
  const page = domPage();
  const stages = [];
  const products = await retrieve(page, 'Blinkit', 'toned milk', { pincode: '201310' }, stage => stages.push(stage));
  assert.equal(products[0].price, 30);
  assert.equal(page.events.filter(value => value === 'https://blinkit.com').length, 2);
  assert.ok(page.events.includes('click:Select manually'));
  assert.ok(page.events.includes('type:201310'));
  assert.equal(stages.at(-1), 'verify_location');
  assert.ok(!page.events.includes('click:ADD'));
});

test('production Zepto flow commits requested location and reads current product slots', async () => {
  const page = domPage({ platform: 'Zepto' });
  const products = await retrieve(page, 'Zepto', 'toned milk', { pincode: '201310' });
  assert.equal(products[0].price, 23);
  assert.ok(page.events.includes('type:201310'));
  assert.equal(page.events.filter(value => value === 'https://www.zepto.com').length, 1);
});

test('confirmation appearing after address selection is handled before reading inventory', async () => {
  const page = domPage({ platform: 'Zepto', confirmLocation: true, delayedConfirmation: true });
  assert.equal((await retrieve(page, 'Zepto', 'toned milk', { pincode: '201310' })).length, 1);
  assert.equal(page.events.filter(value => value === 'click:Confirm Location').length, 1);
});

test('location lost during search navigation discards otherwise valid product cards', async () => {
  const page = domPage({ lostLocation: true });
  await assert.rejects(retrieve(page, 'Blinkit', 'toned milk', { pincode: '201310' }), error => error.status === 'location_unavailable');
});

test('store maintenance is not returned as available inventory or zero matches', async () => {
  const page = domPage({ platform: 'Zepto', storeClosed: true });
  await assert.rejects(retrieve(page, 'Zepto', 'toned milk', { pincode: '201310' }), error => error.status === 'store_unavailable');
  assert.ok(!page.events.some(value => value.includes('/search?')));
});

test('challenge arriving on the search page is classified blocked, not parser or location failure', async () => {
  const page = domPage({ searchBlocked: true });
  await assert.rejects(retrieve(page, 'Blinkit', 'toned milk', { pincode: '201310' }), error => error.status === 'blocked');
  const http = domPage({ searchStatus: 403 });
  await assert.rejects(retrieve(http, 'Blinkit', 'toned milk', { pincode: '201310' }), error => error.status === 'blocked' && error.httpStatus === 403);
});

test('genuine no-results still requires a verified delivery location', async () => {
  const page = domPage({ blank: true });
  assert.deepEqual(await retrieve(page, 'Blinkit', 'toned milk', { pincode: '201310' }), []);
  const lost = domPage({ blank: true, lostLocation: true });
  await assert.rejects(retrieve(lost, 'Blinkit', 'toned milk', { pincode: '201310' }), error => error.status === 'location_unavailable');
});

test('provider diagnostics identify the failed stage and upstream HTTP without exposing private data', async () => {
  const mock = mockBrowser({ searchStatus: 403 });
  const scrape = loader({ 'puppeteer-core': mock.puppeteer })('src/lib/scrapers/quickCommerceBrowser.ts').scrapeQuickCommerce;
  const result = await scrape('Blinkit', 'toned milk', { pincode: '201310' });
  assert.equal(result.source.status, 'blocked');
  assert.equal(result.source.stage, 'search');
  assert.equal(result.source.httpStatus, 403);
  assert.deepEqual(result.products, []);
  assert.ok(!JSON.stringify(result).includes('201310'));
});

test('two active browsers reserve capacity; an excess request is busy and cleanup frees capacity', async () => {
  const launches = [];
  const events = [];
  const browser = { async createBrowserContext() { return { async newPage() { return domPage({ status: 403 }); },
    async close() { events.push('context-closed'); } }; }, async close() { events.push('browser-closed'); } };
  const scrape = loader({ './browserRuntime': { openGroceryBrowser: () => new Promise(resolve => launches.push(resolve)) } })('src/lib/scrapers/quickCommerceBrowser.ts').scrapeQuickCommerce;
  const first = scrape('Blinkit', 'milk', { pincode: '201310' });
  const second = scrape('Zepto', 'milk', { pincode: '201310' });
  assert.equal((await scrape('Blinkit', 'milk', { pincode: '201310' })).source.status, 'busy');
  launches.splice(0).forEach(resolve => resolve(browser));
  assert.ok((await Promise.all([first, second])).every(result => result.source.status === 'blocked'));
  assert.equal(events.filter(event => event === 'context-closed').length, 2);
  const next = scrape('Blinkit', 'milk', { pincode: '201310' });
  assert.equal(launches.length, 1);
  launches.pop()(browser);
  assert.equal((await next).source.status, 'blocked');
});
