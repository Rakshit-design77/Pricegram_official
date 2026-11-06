import puppeteer from 'puppeteer';
import { Product } from '@/types';

export async function scrapeBlinkit(query: string): Promise<Product[]> {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36');
    
    const searchUrl = `https://blinkit.com/s/?q=${encodeURIComponent(query)}`;
    await page.goto(searchUrl, { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });

    // --- Location Picker Bypass ---
    try {
      // 1. Click the "Detect my location" or the "Select Location" button
      await page.waitForSelector('button[style*="background: rgb(12, 131, 31)"]', { timeout: 5000 });
      await page.click('button[style*="background: rgb(12, 131, 31)"]');
      
      // 2. Wait for the location search input
      await page.waitForSelector('input[placeholder*="location"]', { timeout: 3000 });
      await page.type('input[placeholder*="location"]', '110001');
      
      // 3. Wait for suggestions and click the first one
      await new Promise(r => setTimeout(r, 1500));
      const suggestionSelector = 'div.tw-flex.tw-items-center.tw-cursor-pointer'; // Common class for suggestions
      await page.waitForSelector(suggestionSelector, { timeout: 3000 });
      await page.click(suggestionSelector);
      
      // 4. Wait for redirection/load
      await new Promise(r => setTimeout(r, 2000));
    } catch (e) {
      console.log('Location picker already handled or not found.');
    }

    // Wait for actual product cards to appear
    await page.waitForSelector('div[role="button"][id]', { timeout: 10000 }).catch(() => null);

    const products = await page.evaluate(() => {
      function generateId(prefix: string, input: string): string {
        let hash = 0;
        for (let i = 0; i < input.length; i++) {
          hash = ((hash << 5) - hash) + input.charCodeAt(i);
          hash |= 0;
        }
        return `${prefix}-${Math.abs(hash).toString(16)}`;
      }
      
      // Find all cards with role="button" and an ID (product items)
      const items = Array.from(document.querySelectorAll('div[role="button"]')).filter(el => el.id && !isNaN(Number(el.id)));
      
      return items.slice(0, 10).map((item, index) => {
        const titleEl = item.querySelector('div.tw-line-clamp-2') || item.querySelector('div[style*="webkit-line-clamp: 2"]');
        const priceEl = item.querySelector('div:last-child > div:last-child > div:first-child'); // Likely price container
        const imgEl = item.querySelector('img');

        // Look for price containing ₹
        let priceStr = '0';
        const allDivs = Array.from(item.querySelectorAll('div'));
        const priceDiv = allDivs.find(d => d.textContent?.includes('₹'));
        if (priceDiv) {
           priceStr = priceDiv.textContent?.split('₹')[1]?.replace(/[^\d]/g, '') || '0';
        }

        const price = parseInt(priceStr) || 0;
        const mrp = price; // Authentic data: No fake MRP if not provided
        const title = titleEl?.textContent?.trim() || 'Product';

        return {
          id: generateId('blinkit', title),
          title: title,
          price: price,
          mrp: mrp,
          discount: 0,
          image: imgEl?.getAttribute('src') || imgEl?.src || '',
          platform: 'Blinkit' as const,
          deliveryTime: '10-15 mins',
          deliveryFee: 15,
          stockStatus: 'In stock' as const,
          rating: 4.5,
          url: window.location.href,
          category: 'Grocery & Essentials' as const,
        };
      }).filter(p => p.price > 0);
    });

    return products;
  } catch (error) {
    console.error('Blinkit Scraper Error:', error);
    return [];
  } finally {
    await browser.close();
  }
}
