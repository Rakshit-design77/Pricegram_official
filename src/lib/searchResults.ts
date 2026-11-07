import { createHash } from 'node:crypto';
import type { Product } from '@/types';
import { searchTokens } from './searchIntent';
import { rankProductsByRelevance } from './searchRelevance';

// Ignore navigation/advertising parameters, while keeping SKU, seller and variant IDs.
const trackingParameters = new Set([
  'gclid', 'fbclid', 'ref', 'ref_', 'tag', 'srno', 'otracker', 'otracker1',
  'fm', 'iid', 'ppt', 'ppn', 'ssid', 'qh', 'ov_redirect',
]);

function offerIdentity(product: Product): string | null {
  try {
    const url = new URL(product.url);
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;
    url.hash = '';
    for (const key of [...url.searchParams.keys()]) {
      if (key.toLowerCase().startsWith('utm_') || trackingParameters.has(key.toLowerCase())) {
        url.searchParams.delete(key);
      }
    }
    // Flipkart repeats the search term on product URLs; it is not a product variant.
    if ((url.hostname === 'flipkart.com' || url.hostname.endsWith('.flipkart.com')) && url.pathname.includes('/p/')) {
      url.searchParams.delete('q');
    }
    url.searchParams.sort();
    return JSON.stringify([
      product.platform.toLowerCase().trim(),
      url.toString(),
      searchTokens(product.title).join(' '),
    ]);
  } catch {
    return null;
  }
}

export function prepareSearchResults(products: Product[], query: string): (Product & { _score: number })[] {
  const offers = new Map<string, Product>();
  for (const product of products) {
    if (!product || typeof product.title !== 'string' || !product.title.trim() ||
        typeof product.platform !== 'string' || !product.platform.trim() ||
        !Number.isFinite(product.price) || product.price <= 0) continue;
    const identity = offerIdentity(product);
    if (!identity || offers.has(identity)) continue;
    offers.set(identity, {
      ...product,
      // Provider IDs can collide across merchants and repeated listings.
      id: `offer-${createHash('sha256').update(identity).digest('hex').slice(0, 24)}`,
    });
  }
  return rankProductsByRelevance([...offers.values()], query)
    .filter(product => product._score >= -50);
}
