/**
 * PriceGram Affiliate Link Generator
 * Appends custom tracking parameters to product links based on platform.
 */

export function getAffiliateLink(url: string, platform: string): string {
  if (!url) return "";

  try {
    const parsedUrl = new URL(url);
    const lowercasePlatform = platform.toLowerCase();

    if (lowercasePlatform.includes("amazon")) {
      // Amazon Associates Tag
      parsedUrl.searchParams.set("tag", "pricegram-21");
      // Clean up other affiliate tags if they exist
      parsedUrl.searchParams.delete("ref");
    } else if (lowercasePlatform.includes("flipkart")) {
      // Flipkart Affiliate ID
      parsedUrl.searchParams.set("affId", "pricegram");
      parsedUrl.searchParams.delete("affExtParam1");
    } else if (lowercasePlatform.includes("myntra")) {
      // Myntra affiliate tracking
      parsedUrl.searchParams.set("utm_source", "pricegram");
      parsedUrl.searchParams.set("utm_medium", "affiliate");
    } else {
      // Generic quick commerce / fallback tracking
      parsedUrl.searchParams.set("utm_source", "pricegram");
      parsedUrl.searchParams.set("utm_campaign", "price_comparison");
    }

    return parsedUrl.toString();
  } catch (e) {
    // If URL is invalid, return as-is
    return url;
  }
}
