import { GoogleGenAI } from '@google/genai';

async function testOptimizer() {
  console.log('Testing AI Optimizer SDK integration directly...');
  
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("GEMINI_API_KEY not found in .env.local");
    return;
  }
  
  const ai = new GoogleGenAI({ apiKey });
  const queries = [
    "cheap smartphone for my mom under 15k",
    "healthy high protein snacks for gym",
    "a good laptop for coding around 60000"
  ];
  
  for (const query of queries) {
    console.log(`\nOriginal Query: "${query}"`);
    try {
      const prompt = `
        You are an expert e-commerce search optimizer.
        Your task is to take a natural language search query and convert it into a clean, concise keyword-based query suitable for a standard e-commerce search engine (like Amazon or Google Shopping).
        
        Rules:
        1. Remove conversational filler words (e.g., "I want", "show me", "best", "cheap").
        2. If a budget is mentioned (e.g., "under 15k"), translate it to clean text like "under 15000".
        3. Focus strictly on the product, category, and specifications.
        4. Return ONLY the optimized query. Nothing else. Do not use quotes.
        
        User query: "${query}"
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      
      console.log(`Optimized Query: "${response.text?.trim()}"`);
    } catch (e) {
      console.error(`Failed to optimize:`, e);
    }
  }
}

testOptimizer();
