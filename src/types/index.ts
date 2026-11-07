export interface Product {
  id: string;
  title: string;
  image: string;
  price: number;
  mrp: number;
  discount: number;
  platform: Platform;
  deliveryTime: string;
  deliveryFee: number;
  stockStatus: "In stock" | "Few left" | "Out of stock" | "Unknown";
  deliveryFeeKnown?: boolean;
  rating?: number;
  reviews?: number;
  url: string;
  category: Category;
  isBestDeal?: boolean;
  avgPrice?: number;
  dealRating?: number; // 1-5
  competitors?: { platform: string; price: number; url: string }[];
  lastUpdated?: string;
}

export type Platform =
  | "Amazon"
  | "Flipkart"
  | "Blinkit"
  | "Zepto"
  | "Swiggy Instamart"
  | "Flipkart Minutes"
  | "BigBasket"
  | (string & {});

export type Category =
  | "Grocery & Essentials"
  | "Electronics"
  | "Fashion"
  | "Home & Kitchen"
  | "Beauty"
  | "Mobiles"
  | "General"
  | "Others"
  | (string & {});

export type SearchResult =
  | {
      success: true;
      products: Product[];
    }
  | {
      success: false;
      error: "NO_RESULTS" | "PARSER_ERROR" | "API_ERROR" | "RATE_LIMIT";
      products: [];
    };

export interface DeliveryLocation {
  pincode?: string;
  latitude?: number;
  longitude?: number;
}

export type SourceState = 'success' | 'empty' | 'location_required' | 'location_unavailable' |
  'blocked' | 'timeout' | 'browser_unavailable' | 'parse_error' | 'unavailable' | 'busy' | 'store_unavailable';

export type SourceStage = 'browser' | 'storefront' | 'location' | 'search' | 'parse' | 'verify_location';

export interface SearchSource {
  platform: 'Blinkit' | 'Zepto' | 'Marketplace search';
  status: SourceState;
  receivedCount: number;
  matchedCount: number;
  durationMs: number;
  stage?: SourceStage;
  httpStatus?: number;
}

export interface ProviderSearchResult {
  products: Product[];
  source: SearchSource;
}

export interface SearchResponse {
  products: Product[];
  sources: SearchSource[];
}

