// dotenv import removed


import { fetchValueSerpResults } from '../src/lib/scrapers/valueserp';

async function main() {
  const query = 'iphone 15';
  console.log(`[Test] Calling fetchValueSerpResults for query: "${query}"...`);
  try {
    const results = await fetchValueSerpResults(query);
    console.log(`[Test] Received ${results.length} total results.`);
    if (results.length > 0) {
      console.log('--- FIRST 3 RESULTS ---');
      results.slice(0, 3).forEach((item, index) => {
        console.log(`\nResult #${index + 1}:`);
        console.log(`  Title: ${item.title}`);
        console.log(`  Price: ₹${item.price.toLocaleString()}`);
        console.log(`  Platform: ${item.platform}`);
        console.log(`  URL: ${item.url}`);
        console.log(`  Is Mock: ${item.isMock}`);
        console.log(`  Stock: ${item.stockStatus}`);
        console.log(`  Rating: ${item.rating}`);
      });
    } else {
      console.log('[Test] No results returned.');
    }
  } catch (err) {
    console.error('[Test] Error running scraper:', err);
  }
}

main();
