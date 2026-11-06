import puppeteer from 'puppeteer';
import { Product } from '@/types';

export async function scrapeBigBasket(query: string): Promise<Product[]> {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 1000 });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36');
    
    const searchUrl = `https://www.bigbasket.com/ps/?q=${encodeURIComponent(query)}`;
    await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });

    // --- Location Picker Bypass ---
    try {
      // 1. Wait for location picker
      await page.waitForSelector('.LocationPicker___StyledDiv-sc-1sqv8n-0', { timeout: 5000 }).catch(() => null);
      const locationBtn = await page.$('.LocationPicker___StyledDiv-sc-1sqv8n-0') || await page.$('[aria-label="Select Location"]');
      if (locationBtn) await locationBtn.click();
      
      // 2. Type pincode
      await page.waitForSelector('input[placeholder*="pincode"]', { timeout: 3000 }).catch(() => null);
      const pincodeInput = await page.$('input[placeholder*="pincode"]');
      if (pincodeInput) {
        await pincodeInput.type('110001');
        await new Promise(r => setTimeout(r, 1000));
        await page.keyboard.press('Enter');
      }
      
      await new Promise(r => setTimeout(r, 2000));
    } catch (e) {
      console.log('BigBasket location picker already handled or not found.');
    }

    // Wait for product cards
    await page.waitForSelector('.SKUCard__container', { timeout: 10000 }).catch(() => null);

    const products = await page.evaluate(() => {
      function generateId(prefix: string, input: string): string {
        let hash = 0;
        for (let i = 0; i < input.length; i++) {
          hash = ((hash << 5) - hash) + input.charCodeAt(i);
          hash |= 0;
        }
        return `${prefix}-${Math.abs(hash).toString(16)}`;
      }
      const items = Array.from(document.querySelectorAll('.SKUCard__container'));
      
      return items.slice(0, 8).map((item, index) => {
        const titleEl = item.querySelector('h3');
        const priceEl = item.querySelector('.PriceMenu__price___28S_G');
        const mrpEl = item.querySelector('.PriceMenu__mrp___39v.J');
        const imgEl = item.querySelector('img');

        const priceText = priceEl?.textContent?.replace(/[^\d]/g, '') || '0';
        const mrpText = mrpEl?.textContent?.replace(/[^\d]/g, '') || priceText;
        
        const price = parseInt(priceText) || 0;
        const mrp = parseInt(mrpText) || price;
        const discount = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;

        const title = titleEl?.textContent?.trim() || 'Product';
        return {
          id: generateId('bigbasket', title),
          title: title,
          price: price,
          mrp: mrp,
          discount: discount,
          image: imgEl?.src || '',
          platform: 'BigBasket' as const,
          deliveryTime: 'Tomorrow',
          deliveryFee: 0,
          stockStatus: 'In stock' as const,
          rating: 4.4,
          url: 'https://www.bigbasket.com',
          category: 'Grocery & Essentials' as const,
        };
      }).filter(p => p.price > 0);
    });

    return products;
  } catch (error) {
    console.error('BigBasket Scraper Error:', error);
    return [];
  } finally {
    await browser.close();
  }
}
