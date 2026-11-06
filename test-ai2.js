import { GoogleGenAI } from '@google/genai';
import fs from 'fs';

const envContent = fs.readFileSync('.env.local', 'utf-8');
const match = envContent.match(/GEMINI_API_KEY=(.*)/);
const apiKey = match ? match[1] : '';

const ai = new GoogleGenAI({ apiKey });

async function test() {
  try {
    const prompt = `
      You are an expert e-commerce and quick-commerce deal analyst in India.
      Analyze this product and provide intelligent insights.
      
      Product Details:
      - Title: Pepe Jeans Men Slim Mid Rise Blue Jeans
      - Current Price: ₹1055
      - Platform: Flipkart
      
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
      model: 'gemini-1.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });
    console.log("Raw Response:", response.text);
    const jsonStr = response.text.replace(/```json/gi, '').replace(/```/g, '').trim();
    console.log("Parsed:", JSON.parse(jsonStr));
  } catch (e) {
    console.error("ERROR:", e);
  }
}
test();
