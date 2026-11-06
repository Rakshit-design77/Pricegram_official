import puppeteer from 'puppeteer';
import { Product } from '@/types';

export async function scrapeFlipkart(query: string): Promise<Product[]> {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 1000 });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36');
    
    const searchUrl = `https://www.flipkart.com/search?q=${encodeURIComponent(query)}`;
    await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });

    // Wait for result items
    await page.waitForSelector('._1AtVbE, ._4ddWXP, ._1xHGtK', { timeout: 10000 }).catch(() => null);

    const products = await page.evaluate(() => {
      function generateId(prefix: string, input: string): string {
        let hash = 0;
        for (let i = 0; i < input.length; i++) {
          hash = ((hash << 5) - hash) + input.charCodeAt(i);
          hash |= 0;
        }
        return `${prefix}-${Math.abs(hash).toString(16)}`;
      }
      // 1. Try to find JSON-LD data which is very stable
      const jsonLdScripts = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));
      let jsonLdProducts: any[] = [];
      
      jsonLdScripts.forEach(script => {
        try {
          const data = JSON.parse(script.textContent || '{}');
          if (data['@type'] === 'ItemList' && data.itemListElement) {
            jsonLdProducts = data.itemListElement.map((item: any) => {
              const p = item.item;
              if (!p) return null;
              return {
                title: p.name,
                url: p.url || window.location.href,
                image: p.image,
                price: p.offers?.lowPrice || p.offers?.price || 0,
                mrp: p.offers?.highPrice || p.offers?.price || 0,
              };
            }).filter(Boolean);
          }
        } catch (e) {}
      });

      if (jsonLdProducts.length > 0) {
        return jsonLdProducts.map((p, i) => ({
          id: generateId('flipkart-jsonld', p.title),
          title: p.title,
          price: parseInt(p.price) || 0,
          mrp: parseInt(p.mrp) || parseInt(p.price) || 0,
          discount: p.mrp > p.price ? Math.round(((p.mrp - p.price) / p.mrp) * 100) : 0,
          image: p.image || '',
          platform: 'Flipkart' as const,
          deliveryTime: '2-3 Days',
          deliveryFee: 40,
          stockStatus: 'In stock' as const,
          rating: 4.2,
          url: p.url.startsWith('http') ? p.url : `https://www.flipkart.com${p.url}`,
          category: 'General' as const,
        })).filter(p => p.price > 0);
      }

      // 2. Fallback to DOM parsing with more generic selectors
      const items = Array.from(document.querySelectorAll('div[data-id], ._1AtVbE, ._4ddWXP, ._1xHGtK, [class*="product-card"]')).filter(el => el.querySelector('a'));
      
      return items.slice(0, 12).map((item, index) => {
        const titleEl = item.querySelector('._4rR01T') || 
                        item.querySelector('.s1Q9sB') || 
                        item.querySelector('.IRpw9B') || 
                        item.querySelector('a[title]') ||
                        item.querySelector('[class*="title"]');
        
        const priceEl = item.querySelector('._30jeq3') || 
                        item.querySelector('._16Jk6d') ||
                        item.querySelector('[class*="price"]');
                        
        const mrpEl = item.querySelector('._3I9_wc') || 
                      item.querySelector('[class*="mrp"]');
                      
        const imgEl = item.querySelector('img');
        const ratingEl = item.querySelector('._3LWZlK') || item.querySelector('[class*="rating"]');

        const priceText = priceEl?.textContent?.replace(/[^\d]/g, '') || '0';
        const mrpText = mrpEl?.textContent?.replace(/[^\d]/g, '') || priceText;
        
        const price = parseInt(priceText) || 0;
        const mrp = parseInt(mrpText) || price;
        const discount = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;

        let title = titleEl?.textContent?.trim() || 'Product';
        if (title === 'Product' && titleEl?.getAttribute('title')) {
          title = titleEl.getAttribute('title') || 'Product';
        }

        return {
          id: generateId('flipkart-dom', title),
          title: title,
          price: price,
          mrp: mrp,
          discount: discount,
          image: imgEl?.getAttribute('src') || imgEl?.src || '',
          platform: 'Flipkart' as const,
          deliveryTime: '2-3 Days',
          deliveryFee: 40,
          stockStatus: 'In stock' as const,
          rating: parseFloat(ratingEl?.textContent || '0') || 4.2,
          url: 'https://www.flipkart.com',
          category: 'General' as const,
        };
      }).filter(p => p.price > 0);
    });

    return products as Product[];
  } catch (error) {
    console.error('Flipkart Scraper Error:', error);
    return [];
  } finally {
    await browser.close();
  }
}
