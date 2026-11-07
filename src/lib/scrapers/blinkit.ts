import type { DeliveryLocation, ProviderSearchResult } from '@/types';
import { scrapeQuickCommerce } from './quickCommerceBrowser';

export function scrapeBlinkit(query: string, location: DeliveryLocation): Promise<ProviderSearchResult> {
  return scrapeQuickCommerce('Blinkit', query, location);
}
