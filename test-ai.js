import { GoogleGenAI } from '@google/genai';
import fs from 'fs';

const envContent = fs.readFileSync('.env.local', 'utf-8');
const match = envContent.match(/GEMINI_API_KEY=(.*)/);
const apiKey = match ? match[1] : '';

const ai = new GoogleGenAI({ apiKey });

async function test() {
  try {
    const prompt = "Test prompt";
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });
    console.log(response.text);
  } catch (e) {
    console.error("ERROR:", e);
  }
}
test();
