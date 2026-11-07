import type { DeliveryLocation, ProviderSearchResult, SearchResponse } from '@/types';
import { matchesSearchIntent } from './searchIntent';
import { fetchValueSerpResults } from './scrapers/valueserp';
import { scrapeBlinkit } from './scrapers/blinkit';
import { scrapeZepto } from './scrapers/zepto';

export const searchablePlatforms = ['Amazon', 'Flipkart', 'Blinkit', 'Zepto', 'Swiggy Instamart', 'BigBasket'];

export interface SearchOptions {
  location: DeliveryLocation;
  platforms: string[];
}

export async function searchProducts(query: string, options: SearchOptions): Promise<SearchResponse> {
  const wanted = (platform: string) => !options.platforms.length || options.platforms.includes(platform);
  const jobs: { platform: ProviderSearchResult['source']['platform']; run: () => Promise<ProviderSearchResult> }[] = [];
  if (!options.platforms.length || options.platforms.some(platform => platform !== 'Blinkit' && platform !== 'Zepto')) {
    jobs.push({ platform: 'Marketplace search', run: async () => {
      const result = await fetchValueSerpResults(query);
      // Search-engine snippets are not verified Blinkit/Zepto inventory.
      const products = result.success ? result.products.filter(product => wanted(product.platform) &&
        product.platform !== 'Blinkit' && product.platform !== 'Zepto') : [];
      return { products, source: {
        platform: 'Marketplace search',
        status: result.success ? (products.length ? 'success' : 'empty') : result.error === 'NO_RESULTS' ? 'empty' : 'unavailable',
        receivedCount: products.length, matchedCount: 0, durationMs: 0,
      } };
    } });
  }
  if (wanted('Blinkit')) jobs.push({ platform: 'Blinkit', run: () => scrapeBlinkit(query, options.location) });
  if (wanted('Zepto')) jobs.push({ platform: 'Zepto', run: () => scrapeZepto(query, options.location) });

  // Each provider settles independently; one failed browser must not discard marketplace results.
  const results = await Promise.all(jobs.map(async job => {
    const started = Date.now();
    let result: ProviderSearchResult;
    try { result = await job.run(); }
    catch { result = { products: [], source: { platform: job.platform, status: 'unavailable', receivedCount: 0, matchedCount: 0, durationMs: 0 } }; }
    const products = result.source.status === 'success' ? result.products.filter(product =>
      product && typeof product.title === 'string' && Number.isFinite(product.price) &&
      product.price > 0 && matchesSearchIntent(product, query)) : [];
    const source = { ...result.source, matchedCount: products.length, durationMs: Date.now() - started };
    if (source.status === 'success' && !products.length) source.status = 'empty';
    console.info('[Search provider]', JSON.stringify(source));
    return { products, source };
  }));
  return { products: results.flatMap(result => result.products), sources: results.map(result => result.source) };
}
