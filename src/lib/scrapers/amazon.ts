import puppeteer from 'puppeteer';
import { Product } from '@/types';

export async function scrapeAmazon(query: string): Promise<Product[]> {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 1000 });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36');
    
    const searchUrl = `https://www.amazon.in/s?k=${encodeURIComponent(query)}`;
    await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });

    // Wait for search results
    await page.waitForSelector('.s-result-item', { timeout: 10000 }).catch(() => null);

    const products = await page.evaluate(() => {
      function generateId(prefix: string, input: string): string {
        let hash = 0;
        for (let i = 0; i < input.length; i++) {
          hash = ((hash << 5) - hash) + input.charCodeAt(i);
          hash |= 0;
        }
        return `${prefix}-${Math.abs(hash).toString(16)}`;
      }
      const items = Array.from(document.querySelectorAll('.s-result-item[data-component-type="s-search-result"]'));
      
      return items.slice(0, 10).map((item, index) => {
        const titleEl = item.querySelector('h2 span');
        const priceEl = item.querySelector('.a-price-whole');
        const mrpEl = item.querySelector('.a-text-price span[aria-hidden="true"]');
        const imgEl = item.querySelector('img.s-image');
        const ratingEl = item.querySelector('.a-icon-alt');
        const reviewsEl = item.querySelector('.a-size-base.s-underline-text');

        const priceText = priceEl?.textContent?.replace(/[^\d]/g, '') || '0';
        const mrpText = mrpEl?.textContent?.replace(/[^\d]/g, '') || priceText;
        
        const price = parseInt(priceText) || 0;
        const mrp = parseInt(mrpText) || price;
        const discount = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;

        const title = titleEl?.textContent?.trim() || 'Product';
        return {
          id: generateId('amazon', title),
          title: title,
          price: price,
          mrp: mrp,
          discount: discount,
          image: imgEl?.getAttribute('src') || '',
          platform: 'Amazon' as const,
          deliveryTime: 'Tomorrow',
          deliveryFee: 0,
          stockStatus: 'In stock' as const,
          rating: parseFloat(ratingEl?.textContent?.split(' ')[0] || '0') || 4.5,
          reviews: parseInt(reviewsEl?.textContent?.replace(/[^\d]/g, '') || '0'),
          url: 'https://www.amazon.in',
          category: 'Electronics' as const,
        };
      }).filter(p => p.price > 0);
    });

    return products;
  } catch (error) {
    console.error('Amazon Scraper Error:', error);
    return [];
  } finally {
    await browser.close();
  }
}
