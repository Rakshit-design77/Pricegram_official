import puppeteer from 'puppeteer';
import { Product } from '@/types';

export async function scrapeZepto(query: string): Promise<Product[]> {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36');
    
    const searchUrl = `https://www.zeptonow.com/search?q=${encodeURIComponent(query)}`;
    await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });

    // --- Location Picker Bypass ---
    try {
      // 1. Wait for location prompt
      const locationSelectors = ['[data-testid="location-picker-button"]', 'button[aria-label*="Location"]', 'button[aria-label*="location"]'];
      let locationBtn = null;
      for (const sel of locationSelectors) {
        locationBtn = await page.$(sel);
        if (locationBtn) break;
      }
      
      if (locationBtn) {
        await locationBtn.click();
        
        // 2. Type pincode
        await page.waitForSelector('input[placeholder*="pincode"], input[placeholder*="location"]', { timeout: 3000 });
        await page.type('input[placeholder*="pincode"], input[placeholder*="location"]', '110001');
        
        // 3. Select first suggestion
        await new Promise(r => setTimeout(r, 1500));
        await page.keyboard.press('ArrowDown');
        await page.keyboard.press('Enter');
        
        // 4. Wait for redirection
        await new Promise(r => setTimeout(r, 2000));
      }
    } catch (e) {
      console.log('Zepto location picker already handled or not found.');
    }

    // Wait for actual product cards to appear
    await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 }).catch(() => null);

    const products = await page.evaluate(() => {
      function generateId(prefix: string, input: string): string {
        let hash = 0;
        for (let i = 0; i < input.length; i++) {
          hash = ((hash << 5) - hash) + input.charCodeAt(i);
          hash |= 0;
        }
        return `${prefix}-${Math.abs(hash).toString(16)}`;
      }
      const items = Array.from(document.querySelectorAll('[data-testid="product-card"]'));
      
      return items.slice(0, 8).map((item, index) => {
        const titleEl = item.querySelector('h5') || item.querySelector('[data-testid="product-card-name"]');
        const priceEl = item.querySelector('[data-testid="product-card-price"]');
        const mrpEl = item.querySelector('[data-testid="product-card-mrp"]');
        const imgEl = item.querySelector('img');

        const priceText = priceEl?.textContent?.replace(/[^\d]/g, '') || '0';
        const mrpText = mrpEl?.textContent?.replace(/[^\d]/g, '') || priceText;
        
        const price = parseInt(priceText) || 0;
        const mrp = parseInt(mrpText) || price;
        const discount = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;

        const title = titleEl?.textContent?.trim() || 'Product';
        return {
          id: generateId('zepto', title),
          title: title,
          price: price,
          mrp: mrp,
          discount: discount,
          image: imgEl?.src || '',
          platform: 'Zepto' as const,
          deliveryTime: '10 mins',
          deliveryFee: 10,
          stockStatus: 'In stock' as const,
          rating: 4.6,
          url: 'https://www.zeptonow.com',
          category: 'Grocery & Essentials' as const,
        };
      }).filter(p => p.price > 0);
    });

    return products;
  } catch (error) {
    console.error('Zepto Scraper Error:', error);
    return [];
  } finally {
    await browser.close();
  }
}
