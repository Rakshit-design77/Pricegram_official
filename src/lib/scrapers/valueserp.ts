import { Product, Platform, Category, SearchResult } from '@/types';
import { milkSearchQuery, matchesSearchIntent } from '@/lib/searchIntent';
import * as cheerio from 'cheerio';


function generateId(prefix: string, input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = ((hash << 5) - hash) + input.charCodeAt(i);
    hash |= 0;
  }
  return `${prefix}-${Math.abs(hash).toString(16)}`;
}

function detectCategory(title: string, query: string): Category {
  const t = title.toLowerCase();
  const q = query.toLowerCase();
  const text = (t + ' ' + q).trim();

  // 1. Beauty & Personal Care (Evaluate early so moisturizers, body milk, creams, face wash, lotions are not categorized as Grocery)
  if (
    t.includes("lotion") ||
    t.includes("moisturizer") ||
    t.includes("moisturiser") ||
    t.includes("creme") ||
    t.includes("body milk") ||
    t.includes("face wash") ||
    t.includes("serum") ||
    t.includes("sunscreen") ||
    t.includes("spf") ||
    t.includes("lakme") ||
    t.includes("nivea") ||
    t.includes("vaseline") ||
    t.includes("biotique") ||
    t.includes("mamaearth") ||
    t.includes("garnier") ||
    t.includes("pond's") ||
    t.includes("ponds") ||
    t.includes("shampoo") ||
    t.includes("conditioner") ||
    t.includes("makeup") ||
    t.includes("perfume") ||
    t.includes("beauty") ||
    t.includes("cosmetics") ||
    t.includes("skincare")
  ) {
    return "Beauty";
  }

  // 2. Mobiles & Smartphones
  if (
    text.includes("iphone") ||
    text.includes("samsung") ||
    text.includes("oneplus") ||
    text.includes("phone") ||
    text.includes("mobile") ||
    text.includes("pixel") ||
    text.includes("smartphone") ||
    text.includes("mobiles")
  ) {
    return "Mobiles";
  }

  // 3. Home & Kitchen (Frothers, Mugs, Shakers, Utensils, Cookware)
  if (
    t.includes("frother") ||
    t.includes("steamer") ||
    t.includes("warmer") ||
    t.includes("boiler") ||
    t.includes("shaker") ||
    t.includes("mug") ||
    t.includes("whisk") ||
    t.includes("cooker") ||
    t.includes("oven") ||
    t.includes("plate") ||
    t.includes("bottle") ||
    t.includes("kitchen") ||
    t.includes("utensil")
  ) {
    return "Home & Kitchen";
  }

  // 4. Electronics
  if (
    text.includes("laptop") ||
    text.includes("computer") ||
    text.includes("electronics") ||
    text.includes("tv") ||
    text.includes("headphones") ||
    text.includes("earbuds") ||
    text.includes("watch") ||
    text.includes("smartwatch")
  ) {
    return "Electronics";
  }

  // 5. Fashion
  if (
    text.includes("fashion") ||
    text.includes("pants") ||
    text.includes("shirt") ||
    text.includes("shoes") ||
    text.includes("tshirt") ||
    text.includes("t-shirt") ||
    text.includes("jeans") ||
    text.includes("clothes") ||
    text.includes("wear")
  ) {
    return "Fashion";
  }

  // 6. Grocery & Essentials
  if (
    /\b(frooti|maaza|tropicana|mango drink|fruit juice|soft drink)\b/i.test(text) ||
    text.includes("grocery") ||
    text.includes("groceries") ||
    text.includes("essential") ||
    text.includes("maggi") ||
    text.includes("doodh") ||
    text.includes("atta") ||
    text.includes("paneer") ||
    text.includes("butter") ||
    text.includes("ghee") ||
    text.includes("cheese") ||
    text.includes("curd") ||
    text.includes("dahi") ||
    (text.includes("milk") && !t.includes("chocolate") && !t.includes("choco") && !t.includes("eclair") && !t.includes("candy") && !t.includes("truffle") && !t.includes("caramel")) ||
    text.includes("tea") ||
    text.includes("coffee") ||
    text.includes("oil") ||
    text.includes("rice") ||
    text.includes("sugar") ||
    text.includes("salt") ||
    text.includes("dal")
  ) {
    return "Grocery & Essentials";
  }

  return "Others";
}

async function scrapeAmazonDirect(query: string): Promise<Product[]> {
  try {
    const url = `https://www.amazon.in/s?k=${encodeURIComponent(query)}`;
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36"
      },
      cache: 'no-store',
      signal: AbortSignal.timeout(10000),
    });

    console.log(`[Amazon Scraper] Fetching "${url}", Status: ${response.status}`);
    if (response.status !== 200) return [];

    const html = await response.text();
    console.log(`[Amazon Scraper] HTML length: ${html.length}`);
    console.log(`[Amazon Scraper] HTML Snippet: ${html.substring(0, 500)}`);
    console.log(`[Amazon Scraper] Contains 'captcha' or 'robot'?`, html.toLowerCase().includes("captcha") || html.toLowerCase().includes("robot"));

    const $ = cheerio.load(html);
    const items = $('.s-result-item[data-component-type="s-search-result"]');
    console.log(`[Amazon Scraper] Total match items in cheerio: ${items.length}`);
    const products: Product[] = [];

    items.each((index, el) => {
      const item = $(el);
      const title = item.find('h2.a-size-medium span').first().text().trim() ||
                    item.find('h2.a-size-base span').first().text().trim() ||
                    item.find('h2').last().text().trim();

      const priceWhole = item.find('.a-price-whole').first().text().replace(/[^\d]/g, '');
      const price = parseInt(priceWhole) || 0;

      const mrpText = item.find('.a-price.a-text-price span.a-offscreen').first().text().replace(/[^\d]/g, '');
      const mrp = parseInt(mrpText) || price;

      const discount = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;

      const imgEl = item.find('img.s-image').first();
      const image = imgEl.attr('src') || '';

      const linkEl = item.find('a.a-link-normal').first();
      let link = linkEl.attr('href') || '';
      if (link && !link.startsWith('http')) {
        link = `https://www.amazon.in${link}`;
      }

      const ratingText = item.find('.a-icon-alt').first().text().split(' ')[0];
      const rating = parseFloat(ratingText) || 4.2;

      const reviewsText = item.find('.a-size-base.s-underline-text').first().text().replace(/[^\d]/g, '');
      const reviews = parseInt(reviewsText) || 0;

      if (title && price > 0 && link) {
        products.push({
          id: generateId('amazon', title),
          title,
          price,
          mrp,
          discount,
          image,
          platform: 'Amazon',
          deliveryTime: '2-3 Days',
          deliveryFee: 0,
          stockStatus: 'In stock',
          rating,
          reviews,
          url: link,
          category: detectCategory(title, query),
          lastUpdated: new Date().toISOString()
        });
      }
    });

    console.log(`[Amazon Scraper] Found ${products.length} products for query "${query}"`);
    return products.slice(0, 15);
  } catch (err) {
    console.error("[Amazon Scraper Error]", err);
    return [];
  }
}

async function scrapeFlipkartDirect(query: string): Promise<Product[]> {
  try {
    const url = `https://www.flipkart.com/search?q=${encodeURIComponent(query)}`;
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36"
      },
      cache: 'no-store',
      signal: AbortSignal.timeout(10000),
    });

    if (response.status !== 200) return [];

    const html = await response.text();
    const $ = cheerio.load(html);
    const items = $('div[data-id]');
    const products: Product[] = [];

    items.each((index, el) => {
      const item = $(el);

      let title = '';
      const listTitleEl = item.find('.RG5Slk').first();
      const gridTitleEl = item.find('a.atJtCj').first();
      const brandEl = item.find('.Fo1I0b').first();

      if (listTitleEl.length > 0) {
        title = listTitleEl.text().trim();
      } else if (gridTitleEl.length > 0) {
        const brand = brandEl.text().trim();
        title = brand ? `${brand} ${gridTitleEl.text().trim()}` : gridTitleEl.text().trim();
      } else {
        title = item.find('a[title]').attr('title') ||
                item.find('.wSRVsn').text().trim() ||
                item.find('.s1Q9sB').text().trim() ||
                item.find('[class*="title"]').first().text().trim();
      }

      const priceText = item.find('.hZ3P6w').first().text().replace(/[^\d]/g, '') ||
                        item.find('.Nx9Z5j').first().text().replace(/[^\d]/g, '');
      const price = parseInt(priceText) || 0;

      const mrpText = item.find('.kRYCnD').first().text().replace(/[^\d]/g, '') ||
                      item.find('[class*="mrp"]').first().text().replace(/[^\d]/g, '');
      const mrp = parseInt(mrpText) || price;

      const discount = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;

      const imgEl = item.find('img').first();
      const image = imgEl.attr('src') || '';

      const linkEl = item.find('a').first();
      let link = linkEl.attr('href') || '';
      if (link && !link.startsWith('http')) {
        link = `https://www.flipkart.com${link}`;
      }

      const ratingText = item.find('span.CjyrHS').first().text().trim() ||
                        item.find('[class*="rating"]').first().text().trim();
      const rating = parseFloat(ratingText) || 4.1;

      if (title && price > 0 && link) {
        products.push({
          id: generateId('flipkart', title),
          title,
          price,
          mrp,
          discount,
          image,
          platform: 'Flipkart',
          deliveryTime: '2-3 Days',
          deliveryFee: 40,
          stockStatus: 'In stock',
          rating,
          url: link,
          category: detectCategory(title, query),
          lastUpdated: new Date().toISOString()
        });
      }
    });

    console.log(`[Flipkart Scraper] Found ${products.length} products for query "${query}"`);
    return products.slice(0, 15);
  } catch (err) {
    console.error("[Flipkart Scraper Error]", err);
    return [];
  }
}

export const logger = {
  info: (...args: any[]) => console.log('[INFO]', ...args),
  warn: (...args: any[]) => console.warn('[WARN]', ...args),
  error: (...args: any[]) => console.error('[ERROR]', ...args),
};

export function extractShoppingResults(data: any): any[] {
  if (!data) {
    logger.warn('[Parser] Received null or undefined data in extractShoppingResults');
    return [];
  }
  const results: any[] = [];

  if (data.shopping_results) {
    if (Array.isArray(data.shopping_results)) {
      results.push(...data.shopping_results);
    } else if (data.shopping_results.results && Array.isArray(data.shopping_results.results)) {
      results.push(...data.shopping_results.results);
    } else {
      logger.warn('[Parser] Unsupported shopping_results structure:', data.shopping_results);
    }
  }

  if (data.inline_shopping_results) {
    if (Array.isArray(data.inline_shopping_results)) {
      results.push(...data.inline_shopping_results);
    } else if (data.inline_shopping_results.results && Array.isArray(data.inline_shopping_results.results)) {
      results.push(...data.inline_shopping_results.results);
    } else {
      logger.warn('[Parser] Unsupported inline_shopping_results structure:', data.inline_shopping_results);
    }
  }

  return results;
}

export function detectMerchant(item: any): string {
  const merchantField = item.merchant || item.source || item.source_name || '';
  const text = merchantField.toLowerCase();

  if (text.includes('amazon')) return 'Amazon';
  if (text.includes('flipkart')) return 'Flipkart';
  if (text.includes('bigbasket') || text.includes('big basket')) return 'BigBasket';
  if (text.includes('blinkit')) return 'Blinkit';
  if (text.includes('zepto')) return 'Zepto';
  if (text.includes('swiggy') || text.includes('instamart')) return 'Swiggy Instamart';
  if (text.includes('jiomart') || text.includes('jio mart')) return 'JioMart';

  if (item.domain) {
    const platformName = item.domain.replace('www.', '').split('.')[0];
    return platformName.charAt(0).toUpperCase() + platformName.slice(1);
  }
  return merchantField || 'Online Store';
}

export function validateProduct(product: any): boolean {
  if (!product) return false;
  if (!product.title || typeof product.title !== 'string' || product.title.trim().length < 3) {
    logger.warn('[Validation] Product rejected due to missing or short title:', product);
    return false;
  }
  if (typeof product.price !== 'number' || product.price <= 0) {
    logger.warn('[Validation] Product rejected due to invalid price:', product);
    return false;
  }
  if (!product.platform || typeof product.platform !== 'string' || product.platform.trim().length === 0) {
    logger.warn('[Validation] Product rejected due to missing platform/merchant:', product);
    return false;
  }
  return true;
}

export function normalizeProductTitle(title: string): string {
  if (!title) return '';
  return title
    .toLowerCase()
    .replace(/[^\w\s]/g, '') // remove punctuation
    .replace(/\s+/g, ' ')    // collapse whitespace
    .trim();
}

export function cleanProductTitle(title: string): string {
  if (!title) return '';
  return title
    .replace(/\s*(?:Price|Buy Online|at Best Price|Online|India|Online in India|-|:).*$/i, '')
    .replace(/\s*(?:BigBasket|JioMart|Blinkit|Zepto|Amazon|Flipkart|Swiggy Instamart)$/i, '')
    .trim();
}

export async function fetchScaleSerpBackup(query: string, apiKey: string): Promise<Product[]> {
  const apiUrl = `https://api.scaleserp.com/search?api_key=${apiKey}&q=${encodeURIComponent(query)}&gl=in&hl=en&num=20`;
  let response;
  try {
    logger.info(`Fetching from ScaleSERP API for query "${query}"...`);
    response = await fetch(apiUrl, { next: { revalidate: 3600 }, signal: AbortSignal.timeout(15000) });
    if (response.status !== 200) {
      logger.error(`ScaleSERP API returned non-200 status code: ${response.status}`);
      return [];
    }
  } catch (fetchErr) {
    logger.error('ScaleSERP API network fetch failed:', fetchErr);
    return [];
  }

  let data;
  try {
    data = await response.json();
  } catch (jsonErr) {
    logger.error('JSON parsing of API response failed:', jsonErr);
    return [];
  }

  try {
    if (data.request_info && data.request_info.success === false) {
      logger.error(`ScaleSERP API returned request failure:`, data.request_info);
      return [];
    }

    const shoppingResults = extractShoppingResults(data);
    const organicResults = data.organic_results || [];
    const parsedResults: Product[] = [];

    // 1. Map shopping results if present
    if (Array.isArray(shoppingResults) && shoppingResults.length > 0) {
      shoppingResults.forEach((item: any) => {
        let price = 0;
        if (typeof item.price === 'number') price = item.price;
        else if (item.price) price = parseFloat(item.price.toString().replace(/[^\d.]/g, '')) || 0;
        else if (item.price_parsed) price = item.price_parsed.value || 0;

        const link = item.link || item.product_link || item.shopping_link || item.source_link || item.comparison_link;
        let finalUrl = '';
        if (link?.includes('url=')) {
          try {
            const urlObj = new URL(link);
            const realUrl = urlObj.searchParams.get('url') || urlObj.searchParams.get('q');
            if (realUrl?.startsWith('http')) finalUrl = realUrl;
          } catch {}
        }

        if (!finalUrl && link?.startsWith('http') && !link.includes('google.com/shopping')) {
          finalUrl = link;
        }

        if (!finalUrl && item.title) {
          const searchQuery = encodeURIComponent(item.title);
          const merchantLower = (item.merchant || item.source || item.source_name || '').toLowerCase();
          if (merchantLower.includes('flipkart')) {
            finalUrl = `https://www.flipkart.com/search?q=${searchQuery}`;
          } else if (merchantLower.includes('amazon')) {
            finalUrl = `https://www.amazon.in/s?k=${searchQuery}`;
          } else {
            finalUrl = `https://www.google.com/search?q=${searchQuery}+buy+online+India`;
          }
        }

        if (price > 0 && finalUrl) {
          const category = detectCategory(item.title, query);
          const imgUrl = item.image || item.thumbnail || '';
          const platformName = detectMerchant(item);

          const prod = {
            id: generateId('valueserp-shop', item.title),
            title: cleanProductTitle(item.title),
            price: price,
            mrp: Math.round(price * 1.25),
            discount: 20,
            image: imgUrl,
            platform: platformName,
            deliveryTime: item.delivery || 'Standard Delivery',
            deliveryFee: 0,
            stockStatus: 'In stock' as const,
            rating: item.rating || 4.2,
            url: finalUrl,
            category: category,
            lastUpdated: new Date().toISOString()
          };

          if (validateProduct(prod)) {
            parsedResults.push(prod);
          }
        }
      });
    }

    // 2. Map organic results as fallback/supplement
    if (Array.isArray(organicResults) && organicResults.length > 0) {
      organicResults.forEach((item: any) => {
        let price = 0;
        const detected = item.rich_snippet?.top?.detected_extensions;
        if (detected) {
          if (detected.symbol === '₹' && detected.price) {
            price = detected.price;
          } else if (detected.price && detected.price > 100) {
            price = detected.price;
          }
        }

        if (price === 0 && item.rich_snippet?.top?.extensions) {
          for (const ext of item.rich_snippet.top.extensions) {
            const match = ext.match(/(?:₹|Rs\.?)\s*([\d,]+(?:\.\d+)?)/i);
            if (match) {
              price = parseFloat(match[1].replace(/,/g, ''));
              break;
            }
          }
        }

        if (price === 0 && item.snippet) {
          const match = item.snippet.match(/(?:₹|Rs\.?)\s*([\d,]+(?:\.\d+)?)/i);
          if (match) {
            price = parseFloat(match[1].replace(/,/g, ''));
          }
        }

        const domain = (item.domain || '').toLowerCase();
        const isInformational = ['wikipedia.org', 'britannica.com', 'youtube.com', 'quora.com', 'reddit.com', 'pinterest.com', 'news', 'blog'].some(d => domain.includes(d));

        if (price > 0 && !isInformational && item.link) {
          const platformName = detectMerchant(item);
          const category = detectCategory(item.title, query);
          const imgUrl = '';

          let stockStatus: 'In stock' | 'Few left' | 'Out of stock' = 'In stock';
          const extensionsText = JSON.stringify(item.rich_snippet?.top?.extensions || []).toLowerCase();
          const snippetText = (item.snippet || '').toLowerCase();
          if (extensionsText.includes('out of stock') || snippetText.includes('out of stock')) {
            stockStatus = 'Out of stock';
          } else if (extensionsText.includes('few left') || snippetText.includes('few left')) {
            stockStatus = 'Few left';
          }

          let rating = 4.2;
          if (item.rich_snippet?.top?.extensions) {
            for (const ext of item.rich_snippet.top.extensions) {
              const match = ext.match(/^(\d\.\d)/);
              if (match) {
                rating = parseFloat(match[1]);
                break;
              }
            }
          }

          const prod = {
            id: generateId('valueserp-org', item.title),
            title: cleanProductTitle(item.title),
            price: price,
            mrp: Math.round(price * 1.25),
            discount: 20,
            image: imgUrl,
            platform: platformName,
            deliveryTime: '3-5 Days',
            deliveryFee: 0,
            stockStatus: stockStatus,
            rating: rating,
            url: item.link,
            category: category,
            lastUpdated: new Date().toISOString()
          };

          if (validateProduct(prod)) {
            parsedResults.push(prod);
          }
        }
      });
    }

    return parsedResults;
  } catch (apiErr) {
    logger.error('ScaleSERP parsing failed:', apiErr);
    return [];
  }
}

export async function fetchValueSerpResults(query: string): Promise<SearchResult> {
  logger.info(`Fetching results for: "${query}"`);

  const isGroceryQuery = detectCategory('', query) === 'Grocery & Essentials';
  const sourceQuery = milkSearchQuery(query);

  // 1. Try direct scraping of Amazon and Flipkart in parallel
  let directResults: Product[] = [];
  try {
    const [amazonResults, flipkartResults] = await Promise.all([
      scrapeAmazonDirect(sourceQuery),
      scrapeFlipkartDirect(sourceQuery)
    ]);
    directResults = [...amazonResults, ...flipkartResults].filter(validateProduct)
      .filter(product => matchesSearchIntent(product, query));
  } catch (err) {
    logger.error('Direct scraping failed:', err);
  }

  // If it's NOT a grocery query and we found direct results, return them immediately (zero-cost bypass)
  if (directResults.length > 0 && !isGroceryQuery) {
    logger.info(`Direct scraping succeeded with ${directResults.length} total results.`);
    return { success: true, products: directResults };
  }

  // Grocery cards must come from direct store retrieval, not general web-search snippets.
  // Keep the existing optional fallback for non-grocery searches.
  const apiKey = process.env.VALUESERP_API_KEY;
  if (apiKey && !isGroceryQuery) {
    try {
      const scaleSerpProducts = (await fetchScaleSerpBackup(sourceQuery, apiKey))
        .filter(product => matchesSearchIntent(product, query));
      if (scaleSerpProducts.length > 0) {
        // Merge ScaleSERP results (which contain the local fresh groceries) and direct scraper results
        const combined = [...scaleSerpProducts, ...directResults];
        logger.info(`ScaleSERP returned ${scaleSerpProducts.length} results. Merged with direct. Total: ${combined.length}`);
        return { success: true, products: combined };
      }
    } catch (err) {
      logger.error('ScaleSERP search fallback failed:', err);
    }
  }

  // If ScaleSERP failed but we have direct scraping results, use them as absolute backup
  if (directResults.length > 0) {
    logger.warn(`ScaleSERP backup failed or empty, returning ${directResults.length} direct scraping results.`);
    return { success: true, products: directResults };
  }

  return { success: false, error: 'NO_RESULTS', products: [] };
}
