require('dotenv').config({ path: '.env.local' });
const { fetchValueSerpResults } = require('./src/lib/scrapers/valueserp');

async function test() {
  console.log("Testing scraper for 'milk'...");
  const results = await fetchValueSerpResults("milk");
  console.log(`Found ${results.length} results.`);
  if (results.length > 0) {
    console.log("First result:", JSON.stringify(results[0], null, 2));
  } else {
    console.log("No results found. This might be the issue.");
  }
}

test();
