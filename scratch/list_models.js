import { GoogleGenAI } from '@google/genai';
import fs from 'fs';

const envContent = fs.readFileSync('.env.local', 'utf-8');
const match = envContent.match(/GEMINI_API_KEY=(.*)/);
const apiKey = match ? match[1] : '';

const ai = new GoogleGenAI({ apiKey });

async function listModels() {
  try {
    const response = await ai.models.list();
    if (response.pageInternal && Array.isArray(response.pageInternal)) {
      const names = response.pageInternal.map(m => m.name);
      console.log("Available Gemini models:", names.filter(n => n.includes('gemini')));
    } else {
      console.log("pageInternal is not an array or missing:", response.pageInternal);
    }
  } catch (e) {
    console.error("ERROR listing models:", e);
  }
}
listModels();
