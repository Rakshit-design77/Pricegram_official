import { GoogleGenAI } from '@google/genai';
import fs from 'fs';

const envContent = fs.readFileSync('.env.local', 'utf-8');
const match = envContent.match(/GEMINI_API_KEY=(.*)/);
const apiKey = match ? match[1] : '';

const ai = new GoogleGenAI({ apiKey });

const modelsToTest = [
  'gemini-2.5-flash-lite',
  'gemini-2.0-flash-lite',
  'gemini-3.5-flash',
  'gemini-3.1-flash-lite',
  'gemini-2.5-flash',
  'gemini-2.0-flash'
];

async function testModels() {
  for (const model of modelsToTest) {
    console.log(`Testing model: ${model}...`);
    try {
      const response = await ai.models.generateContent({
        model: model,
        contents: "Hello, reply with just one word: Success",
      });
      console.log(`  RESULT for ${model}: SUCCESS -> "${response.text?.trim()}"`);
      // If we find a working model, we can stop or keep listing
    } catch (e) {
      console.log(`  RESULT for ${model}: FAILED ->`, e.message || e.toString());
    }
  }
}
testModels();
