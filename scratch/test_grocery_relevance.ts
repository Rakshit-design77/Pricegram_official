import { fetchValueSerpResults } from '../src/lib/scrapers/valueserp';
import { rankProductsByRelevance } from '../src/lib/searchRelevance';
import fs from 'fs';

// Load env vars
const envContent = fs.readFileSync('.env.local', 'utf-8');
envContent.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length === 2) {
    process.env[parts[0].trim()] = parts[1].trim();
  }
});

async function runRelevanceTest() {
  const query = "milk";
  console.log(`Starting relevance test for query: "${query}"`);
  
  try {
    const results = await fetchValueSerpResults(query);
    if (!results.success) {
      console.error("Search failed:", results.error);
      return;
    }
    
    console.log(`\nRaw results count: ${results.products.length}`);
    results.products.slice(0, 10).forEach((p, idx) => {
      console.log(`Raw [${idx+1}] Title: "${p.title}" | Price: ${p.price} | Platform: ${p.platform}`);
    });

    const ranked = rankProductsByRelevance(results.products, query);
    console.log(`\nRanked results count: ${ranked.length}`);
    ranked.forEach((p, idx) => {
      console.log(`Ranked [${idx+1}] Score: ${p._score ?? 'N/A'} | Title: "${p.title}" | Price: ${p.price} | Platform: ${p.platform}`);
    });
  } catch (error) {
    console.error("Test failed with error:", error);
  }
}

runRelevanceTest();
