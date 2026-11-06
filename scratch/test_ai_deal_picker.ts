import { GoogleGenAI } from '@google/genai';

async function testDealPicker() {
  console.log('Testing AI Deal Picker Insights...');
  
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("GEMINI_API_KEY not found in env");
    return;
  }
  
  const ai = new GoogleGenAI({ apiKey });
  const products = [
    { title: "Apple iPhone 15 (128GB)", price: 65999, platform: "Amazon" },
    { title: "Amul Taaza Homogenised Toned Milk, 1 L", price: 72, platform: "Blinkit" }
  ];
  
  for (const product of products) {
    console.log(`\nAnalyzing: ${product.title} on ${product.platform} at ₹${product.price}`);
    try {
      const prompt = `
        You are an expert e-commerce and quick-commerce deal analyst in India.
        Analyze this product and provide intelligent insights.
        
        Product Details:
        - Title: ${product.title}
        - Current Price: ₹${product.price}
        - Platform: ${product.platform}
        
        Task:
        Generate a JSON response analyzing this deal. Do NOT include markdown formatting (like \`\`\`json). Just raw JSON.
        
        Requirements for the JSON fields:
        1. "verdict": A short, confident 1-2 sentence recommendation on whether to buy this now or wait.
        2. "isLowestPrice": boolean. Guess if this is a great price based on general market knowledge.
        3. "alternatives": An array of exactly 1 or 2 alternative platforms (like Amazon, Flipkart, Blinkit, Zepto) where it might be cheaper or have better benefits. Format: { "platform": "string", "price": number (estimated), "benefit": "string (e.g., Free delivery, Bank discount)" }
        4. "bundleSavings": An array of 1 or 2 short strings suggesting what to buy with this to save money or get a combo discount.

        Output strictly as valid JSON matching this structure:
        {
          "verdict": "string",
          "isLowestPrice": boolean,
          "alternatives": [
            { "platform": "string", "price": 0, "benefit": "string" }
          ],
          "bundleSavings": ["string"]
        }
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      
      const rawText = response.text?.trim() || "";
      const jsonStr = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
      
      const parsedData = JSON.parse(jsonStr);
      console.log(JSON.stringify(parsedData, null, 2));
    } catch (e) {
      console.error(`Failed to analyze:`, e);
    }
  }
}

testDealPicker();
