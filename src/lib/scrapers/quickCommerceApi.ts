import { z } from 'zod';
import type { ProviderSearchResult, SourceState } from '@/types';
import { parseGroceryCards } from './quickCommerceProducts';

type Store = 'Blinkit' | 'Zepto';
type Coordinates = { latitude: number; longitude: number };

const searchResponse = z.object({
  status: z.literal('success'),
  data: z.object({ platform: z.string(), products: z.array(z.unknown()) }),
});

const listing = z.object({
  name: z.string(),
  quantity: z.string().nullish(),
  offer_price: z.number().positive(),
  mrp: z.number().nullish(),
  deeplink: z.string(),
  images: z.array(z.string()).nullish(),
  available: z.boolean().nullish(),
  currency: z.literal('INR').nullish(),
});

export async function fetchQuickCommerceProducts(
  store: Store,
  query: string,
  location: Coordinates,
  apiKey: string,
): Promise<ProviderSearchResult> {
  const started = Date.now();
  const result = (status: SourceState, products: ProviderSearchResult['products'] = [], httpStatus?: number): ProviderSearchResult => ({
    products,
    source: {
      platform: store, status, stage: status === 'parse_error' ? 'parse' : 'search', httpStatus,
      receivedCount: products.length, matchedCount: 0, durationMs: Date.now() - started,
    },
  });

  const platform = store === 'Blinkit' ? 'BlinkIt' : 'Zepto';
  const url = new URL('https://api.quickcommerceapi.com/v1/search');
  url.search = new URLSearchParams({
    q: query, platform, lat: String(location.latitude), lon: String(location.longitude),
  }).toString();

  const signal = AbortSignal.timeout(12000);
  let response: Response;
  try {
    response = await fetch(url, {
      headers: { 'X-API-Key': apiKey, Accept: 'application/json' },
      cache: 'no-store', redirect: 'error', signal,
    });
  } catch {
    return result(signal.aborted ? 'timeout' : 'unavailable');
  }
  if (!response.ok) return result(response.status === 429 ? 'busy' : 'unavailable', [], response.status);

  const payload = searchResponse.safeParse(await response.json().catch(() => null));
  if (!payload.success || payload.data.data.platform.toLowerCase() !== platform.toLowerCase()) {
    return result(signal.aborted ? 'timeout' : 'parse_error');
  }

  const rows = payload.data.data.products;
  const products = parseGroceryCards(store, rows.flatMap(row => {
    const parsed = listing.safeParse(row);
    if (!parsed.success) return [];
    const item = parsed.data;
    return [{
      title: item.name,
      unit: item.quantity ?? undefined,
      priceText: String(item.offer_price),
      mrpText: item.mrp == null ? undefined : String(item.mrp),
      url: item.deeplink,
      image: item.images?.find(image => image.startsWith('https://')),
      inStock: item.available ?? undefined,
    }];
  }));
  return result(products.length ? 'success' : rows.length ? 'parse_error' : 'empty', products);
}
