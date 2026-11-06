import { generateGeminiContent } from '../src/lib/gemini';

async function verifyFallback() {
  console.log('Testing the robust Gemini helper...');
  try {
    const response = await generateGeminiContent({
      contents: 'Respond with the word "Antigravity" if you can hear me.',
    });
    console.log('Gemini Helper Response:', response.text?.trim());
  } catch (error: any) {
    console.error('Gemini Helper Failed:', error);
  }
}

verifyFallback();
