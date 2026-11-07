import { createHash } from 'node:crypto';
import * as cheerio from 'cheerio';
import type { Product } from '@/types';

export interface GroceryCard {
  title: string;
  unit?: string;
  priceText: string;
  mrpText?: string;
  url: string;
  image?: string;
  inStock?: boolean;
}

export const groceryCardSelectors = {
  Blinkit: '[data-test-id="plp-product"], [data-testid="product-card"], [class*="Product__UpdatedPlpProductContainer"], div[role="button"][id]',
  Zepto: '[data-testid="product-card"], a[href*="/pn/"][href*="/pvid/"]',
};

export function readGroceryCards(platform: 'Blinkit' | 'Zepto', html: string): GroceryCard[] {
  const $ = cheerio.load(html);
  const cards: GroceryCard[] = [];
  $(groceryCardSelectors[platform]).each((_, element) => {
    const card = $(element);
    const text = card.text();
    // Current Blinkit cards use tw-* classes; current Zepto cards use data-slot-id.
    // Keep the older selectors for storefront variants, without guessing titles from whole-card text.
    const title = card.find('[data-slot-id="ProductName"], [data-testid="product-card-name"], [data-test-id="product-title"], [class*="Product__UpdatedTitle"], .tw-line-clamp-2.tw-font-semibold, h3, h5').first().text().trim();
    const unit = card.find('[data-slot-id="PackSize"], [data-testid="product-card-quantity"], [data-testid="product-quantity"], [class*="Product__UpdatedDesc"], [class*="Product__UpdatedQuantity"], .tw-line-clamp-1.tw-font-medium').first().text().trim();
    const price = card.find('[data-testid="product-card-price"], [data-testid="product-price"], [class*="Product__UpdatedPriceAndAtcContainer"] > div').first().text();
    const slotPrices = card.find('[data-slot-id="EdlpPrice"] > span');
    const mrpSelector = '[data-testid="product-card-mrp"], del, s, [class*="Mrp"], [class*="mrp"], .tw-line-through, .line-through';
    const currency = card.find('*').filter((_, el) => {
      const node = $(el);
      return node.children().length === 0 && /₹\s*[\d,]+/.test(node.text()) && !node.closest(mrpSelector).length;
    }).first().text();
    const href = card.attr('href') || card.find('a[href*="/prid/"], a[href*="/pvid/"]').first().attr('href');
    const id = card.attr('id') || card.attr('data-product-id');
    let url = '';
    if (href) {
      try { url = new URL(href, platform === 'Blinkit' ? 'https://blinkit.com' : 'https://www.zepto.com').href; } catch { /* Invalid cards are rejected. */ }
    } else if (platform === 'Blinkit' && id && /^\d+$/.test(id)) {
      url = `https://blinkit.com/prn/${encodeURIComponent(title.toLowerCase().replace(/\s+/g, '-'))}/prid/${id}`;
    }
    const outOfStock = card.find('[data-is-out-of-stock="true"]').length > 0 || card.attr('data-is-out-of-stock') === 'true';
    cards.push({ title, unit, priceText: slotPrices.first().text() || price || currency,
      mrpText: slotPrices.eq(1).text() || card.find(mrpSelector).first().text(),
      url, image: card.find('img').first().attr('src'),
      inStock: outOfStock || /out of stock|sold out|notify me/i.test(text) ? false :
        card.find('button, [role="button"]').toArray().some(el => /^add$/i.test($(el).text().trim()) &&
          !$(el).is('[disabled], [aria-disabled="true"]')) ? true : undefined,
    });
  });
  return cards;
}

function rupees(text: string | undefined): number {
  if (!text) return NaN;
  const number = text.match(/(?:₹|Rs\.?|INR)\s*([\d,]+(?:\.\d{1,2})?)/i)?.[1] ??
    text.trim().match(/^([\d,]+(?:\.\d{1,2})?)$/)?.[1];
  return number ? Number(number.replace(/,/g, '')) : NaN;
}

export function parseGroceryCards(platform: 'Blinkit' | 'Zepto', cards: GroceryCard[]): Product[] {
  const allowedHost = platform === 'Blinkit' ? 'blinkit.com' : 'zepto.com';
  const products: Product[] = [];
  for (const card of cards) {
    const price = rupees(card.priceText);
    if (!card.title?.trim() || !Number.isFinite(price) || price <= 0) continue;
    let url: URL;
    try { url = new URL(card.url); } catch { continue; }
    if (url.protocol !== 'https:' || (url.hostname !== allowedHost && url.hostname !== `www.${allowedHost}`)) continue;
    if (platform === 'Blinkit' ? !/\/prid\/\d+/.test(url.pathname) : !/\/pvid\/[^/]+/.test(url.pathname)) continue;
    const statedMrp = rupees(card.mrpText);
    const mrp = Number.isFinite(statedMrp) && statedMrp >= price ? statedMrp : price;
    const unit = card.unit?.trim();
    const title = card.title.trim() + (unit && !card.title.toLowerCase().includes(unit.toLowerCase()) ? ` ${unit}` : '');
    let image = `/logos/${platform.toLowerCase()}.webp`;
    try { const parsed = new URL(card.image ?? ''); if (parsed.protocol === 'https:') image = parsed.href; } catch { /* Use merchant logo. */ }
    products.push({
      id: `${platform.toLowerCase()}-${createHash('sha256').update(url.href + title).digest('hex').slice(0, 24)}`,
      title, price, mrp, discount: mrp > price ? Math.round((mrp - price) / mrp * 100) : 0,
      image, platform, url: url.href, category: 'Grocery & Essentials',
      stockStatus: card.inStock === false ? 'Out of stock' : card.inStock === true ? 'In stock' : 'Unknown',
      deliveryTime: 'Check at checkout', deliveryFee: 0, deliveryFeeKnown: false,
      lastUpdated: new Date().toISOString(),
    });
  }
  return products;
}
