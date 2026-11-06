import fs from 'fs';

const envContent = fs.readFileSync('.env.local', 'utf-8');
const match = envContent.match(/VALUESERP_API_KEY=(.*)/);
const apiKey = match ? match[1].trim() : '';

async function testScaleSerp() {
  if (!apiKey) {
    console.error("VALUESERP_API_KEY not found in .env.local");
    return;
  }
  const query = "Amul milk";
  const apiUrl = `https://api.scaleserp.com/search?api_key=${apiKey}&q=${encodeURIComponent(query)}&gl=in&hl=en&num=20`;
  
  try {
    console.log("Calling ScaleSERP API...");
    const response = await fetch(apiUrl);
    const data = await response.json();
    
    if (data.shopping_results) {
      console.log(`Found ${data.shopping_results.length} shopping results.`);
      data.shopping_results.forEach((item, i) => {
        console.log(`[${i+1}] Title: "${item.title}" | Price: ${item.price} | Merchant: "${item.merchant || item.source}"`);
      });
    } else {
      console.log("No shopping results found. Organic results count:", data.organic_results?.length);
      data.organic_results?.slice(0, 5).forEach((item, i) => {
        console.log(`[Organic ${i+1}] Title: "${item.title}" | Snippet: "${item.snippet}"`);
      });
    }
  } catch (e) {
    console.error("ERROR:", e);
  }
}
testScaleSerp();
