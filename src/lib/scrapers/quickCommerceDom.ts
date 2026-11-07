// These functions run in the storefront page. Keep them self-contained (no imported closures).
export const groceryLocationSelectors = {
  input: 'input[placeholder*="location" i], input[placeholder*="address" i], input[placeholder*="pincode" i], input[placeholder*="pin code" i], input[placeholder*="area" i]',
  header: '[data-testid="user-address"], [data-testid="delivery-location"], [class*="LocationBar__Subtitle-sc"], [data-testid="location-picker-button"]',
  // Match complete suggestion rows, never the shorter nested postcode label.
  suggestion: '[data-testid="address-search-item"], [class*="LocationSearchList__LocationDetailContainer"], [role="option"], [data-testid*="address-option"]',
};

export interface GroceryDomConfig {
  input: string;
  header: string;
  suggestion: string;
  cards: string;
  query?: string;
}

export function groceryPageState(config: GroceryDomConfig) {
  const visible = (el: Element) => Boolean(el.getClientRects().length) && getComputedStyle(el).visibility !== 'hidden';
  const normalize = (value: string) => value.replace(/\s+/g, ' ').trim();
  const text = document.body?.innerText || '';
  const locationLabel = [...document.querySelectorAll<HTMLElement>(config.header)].filter(visible)
    .map(el => normalize(el.innerText)).find(value => value && !/^(select|choose|set|detecting)\b/i.test(value)) || '';
  const editing = [...document.querySelectorAll(config.input)].some(visible);
  const locationPending = [...document.querySelectorAll<HTMLElement>('[role="dialog"], [data-testid="address-modal"]')]
    .some(el => visible(el) && /(?:select|detecting|confirm|your) (?:your |delivery )?(?:location|address|area)|select manually/i.test(el.innerText));
  const storeUnavailable = /\bstore (?:under maintenance|closed|temporarily unavailable)\b|\btemporarily not accepting orders\b/i.test(text);
  const unserviceable = /not serviceable|don[’']?t deliver|do not deliver|outside (?:our |the )?delivery area|not delivering (?:here|to this location)/i.test(text);
  const blocked = /verify you are human|access denied|request blocked|unusual traffic|(?:complete|solve) (?:the |a )?captcha/i.test(text);
  const empty = /no (products|results|items) found|couldn[’']?t find any|sorry[!,]? no results/i.test(text);
  // A skeleton or footer product link is not a loaded product card.
  const cardsReady = [...document.querySelectorAll<HTMLElement>(config.cards)].some(el =>
    visible(el) && /₹\s*\d/.test(el.innerText));
  const queryConfirmed = !config.query || [...document.querySelectorAll<HTMLElement>('h1, h2, [role="button"], button')]
    .some(el => visible(el) && normalize(el.innerText).toLowerCase().replace(/["“”]/g, '') ===
      `showing results for ${normalize(config.query!).toLowerCase()}`);
  return { locationLabel, editing, locationPending, storeUnavailable, unserviceable, blocked, empty, cardsReady, queryConfirmed };
}

export type LocationAction = 'entry' | 'suggestion' | 'confirm';
export interface LocationTarget { kind: string; element: HTMLElement }
export function findLocationTarget(options: GroceryDomConfig & {
  action: LocationAction;
  pincode?: string;
  gps?: boolean;
  exclude?: string[];
}): LocationTarget | null {
  const visible = (el: Element) => Boolean(el.getClientRects().length) && getComputedStyle(el).visibility !== 'hidden';
  const text = (el: HTMLElement) => (el.getAttribute('aria-label') || el.innerText || '').replace(/\s+/g, ' ').trim();
  const byText = (pattern: RegExp) => [...document.querySelectorAll<HTMLElement>('button, [role="button"], a, div, span, p')]
    .filter(el => visible(el) && !el.matches('[disabled], [aria-disabled="true"]') && pattern.test(text(el)))
    .find(el => ![...el.children].some(child => visible(child) && pattern.test(text(child as HTMLElement))));
  const first = (selector: string) => [...document.querySelectorAll<HTMLElement>(selector)].find(visible);
  if (options.action === 'suggestion') {
    if (!options.pincode || !/^[1-9]\d{5}$/.test(options.pincode)) return null;
    const postcode = new RegExp(`(?:^|\\D)${options.pincode}(?:\\D|$)`);
    const element = [...document.querySelectorAll<HTMLElement>(options.suggestion)].find(el =>
      visible(el) && el.innerText.length < 500 && postcode.test(el.innerText));
    return element ? { kind: 'suggestion', element } : null;
  }
  if (options.action === 'confirm') {
    const element = byText(/^(confirm(?: location| address| & continue)?|use this location|save (?:and|&) continue)$/i);
    return element ? { kind: 'confirm', element } : null;
  }
  const choices = [
    { kind: 'continue', element: byText(/^continue on web$/i) },
    { kind: 'manual', element: options.gps ? undefined : byText(/^select manually$/i) },
    { kind: 'gps', element: options.gps ? byText(/^(?:detect(?: my)?|use(?: my| your)?) (?:current )?location$/i) : undefined },
    { kind: 'input', element: options.gps ? undefined : first(options.input) },
    { kind: 'header', element: first(options.header) || byText(/^(?:select|choose|change|set) (?:a |your |delivery )?(?:location|address)$/i) },
  ];
  const choice = choices.find(choice => choice.element && !options.exclude?.includes(choice.kind));
  return choice?.element ? { kind: choice.kind, element: choice.element } : null;
}
