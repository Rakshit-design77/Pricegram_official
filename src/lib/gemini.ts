import { GoogleGenAI } from '@google/genai';

const FALLBACK_MODELS = [
  'gemini-2.5-flash',
  'gemini-3.5-flash',
  'gemini-3.1-flash-lite',
];

interface GenerateOptions {
  contents: string;
  config?: any;
}

/**
 * Robust wrapper to generate content from Gemini using fallback models
 * in case of high demand (503) or rate limits.
 */
export async function generateGeminiContent(options: GenerateOptions) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  const ai = new GoogleGenAI({ apiKey });
  let lastError: any = null;

  for (const model of FALLBACK_MODELS) {
    try {
      console.log(`[AI] Attempting content generation with model: ${model}`);
      const response = await ai.models.generateContent({
        model,
        contents: options.contents,
        config: options.config,
      });
      console.log(`[AI] Content generation succeeded with model: ${model}`);
      return response;
    } catch (error: any) {
      console.warn(`[AI] Model ${model} failed:`, error.message || error.toString());
      lastError = error;
      // Fallback to the next model in line
    }
  }

  throw lastError || new Error('Failed to generate content with all fallback models');
}
