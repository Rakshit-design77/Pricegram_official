import type { DeliveryLocation, ProviderSearchResult } from '@/types';
import { scrapeQuickCommerce } from './quickCommerceBrowser';

export function scrapeZepto(query: string, location: DeliveryLocation): Promise<ProviderSearchResult> {
  return scrapeQuickCommerce('Zepto', query, location);
}
