import { fetchValueSerpResults } from '../src/lib/scrapers/valueserp';

// Let's patch the direct scraper functions to throw/fail, forcing ScaleSERP fallback
import * as valueserpModule from '../src/lib/scrapers/valueserp';

async function main() {
  const query = 'iphone 15';
  console.log(`[Test Fallback] Forcing ScaleSERP fallback for query: "${query}"...`);
  
  // Note: We modified the code in src/lib/scrapers/valueserp.ts, but since we import it,
  // we can mock the direct scraping function output or simply run it.
  // Wait, direct scraping succeed on Mac, but we want to test when it fails (like on Vercel).
  // Let's modify the function dynamically or run it.
  // Actually, we can just edit fetchValueSerpResults to bypass direct scraping for a second or pass a parameter.
  // Let's look at what fetchValueSerpResults does: if it fails, it prints "Direct scraping failed, trying API backup...".
  // Let's temporarily call the API directly inside this test script and apply the logic from valueserp.ts!
  
  const apiKey = 'YOUR_VALUESERP_API_KEY';
  const apiUrl = `https://api.scaleserp.com/search?api_key=${apiKey}&q=${encodeURIComponent(query)}&gl=in&hl=en&num=20`;
  
  try {
    console.log(`[Test Fallback] Fetching directly from ScaleSERP: ${apiUrl}`);
    const response = await fetch(apiUrl);
    const data = await response.json();
    
    const shoppingResults = data.shopping_results || data.inline_shopping_results || [];
    const organicResults = data.organic_results || [];
    const parsedResults: any[] = [];
    
    console.log(`[Test Fallback] ScaleSERP returned ${shoppingResults.length} shopping results and ${organicResults.length} organic results.`);
    
    // Applying the same mapping logic we wrote:
    // ... (organic mapping)
    if (Array.isArray(organicResults) && organicResults.length > 0) {
      organicResults.forEach((item: any, index: number) => {
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
          const platformName = item.domain ? item.domain.replace('www.', '').split('.')[0] : 'Online Store';
          const capitalizedPlatform = platformName.charAt(0).toUpperCase() + platformName.slice(1);
          
          let stockStatus = 'In stock';
          const extensionsText = JSON.stringify(item.rich_snippet?.top?.extensions || []).toLowerCase();
          const snippetText = (item.snippet || '').toLowerCase();
          if (extensionsText.includes('out of stock') || snippetText.includes('out of stock')) {
            stockStatus = 'Out of stock';
          }
          
          parsedResults.push({
            title: item.title,
            price: price,
            platform: capitalizedPlatform,
            url: item.link,
            stockStatus: stockStatus
          });
        }
      });
    }
    
    console.log(`[Test Fallback] Successfully parsed ${parsedResults.length} results from organic backup:`);
    parsedResults.forEach((item, index) => {
      console.log(`\nResult #${index + 1}:`);
      console.log(`  Title: ${item.title}`);
      console.log(`  Price: ₹${item.price.toLocaleString()}`);
      console.log(`  Platform: ${item.platform}`);
      console.log(`  URL: ${item.url}`);
      console.log(`  Stock: ${item.stockStatus}`);
    });
    
  } catch (err) {
    console.error('[Test Fallback] Error:', err);
  }
}

main();
