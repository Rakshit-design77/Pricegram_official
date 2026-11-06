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
  stockStatus: "In stock" | "Few left" | "Out of stock";
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

