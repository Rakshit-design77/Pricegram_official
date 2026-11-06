import { NextResponse } from 'next/server';
import { generateGeminiContent } from '@/lib/gemini';
import { validateEnvironment } from '@/lib/env';
import { Redis } from '@upstash/redis';
import { memoryStore } from '@/lib/memoryCache';
import { auth } from '@clerk/nextjs/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(request: Request) {
  try {
    validateEnvironment();

    const { searchParams } = new URL(request.url);
    const title = searchParams.get('title') || '';
    const priceVal = parseFloat(searchParams.get('price') || '0');
    const platform = searchParams.get('platform') || 'Unknown';

    if (!title || priceVal === 0) {
      return NextResponse.json({ error: 'Missing product details' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'AI not configured' }, { status: 503 });
    }

    // 1. Freemium Rate Limiting (5 per day per IP)
    // BYPASS for authenticated (logged-in) users
    const { userId } = await auth();
    let currentUsage = 0;
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'anonymous';
    const rateLimitKey = `ai_rate_limit:${ip}`;

    if (!userId) {
      if (process.env.UPSTASH_REDIS_REST_URL) {
        const redis = Redis.fromEnv();
        currentUsage = await redis.get<number>(rateLimitKey) || 0;
      } else {
        // Zero-config fallback
        currentUsage = memoryStore.getRateLimit(rateLimitKey);
      }
      
      if (currentUsage >= 5) {
        return NextResponse.json({ 
          error: 'Freemium limit reached. Upgrade to Premium for unlimited AI insights.',
          isFreemiumLimit: true
        }, { status: 403 });
      }
    }

    // 2. Caching Layer (Zero-cost scaling)
    const productKey = `ai_insight:${Buffer.from(`${title}-${platform}`).toString('base64')}`;
    
    let cachedData = null;
    if (process.env.UPSTASH_REDIS_REST_URL) {
      const redis = Redis.fromEnv();
      cachedData = await redis.get(productKey);
    } else {
      cachedData = memoryStore.get(productKey);
    }

    if (cachedData) {
      // Return instantly from cache!
      return NextResponse.json(cachedData);
    }

    const prompt = `
      You are an expert e-commerce and quick-commerce deal analyst in India.
      Analyze this product and provide intelligent insights.
      
      Product Details:
      - Title: ${title}
      - Current Price: ₹${priceVal}
      - Platform: ${platform}
      
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

    const response = await generateGeminiContent({
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    const rawText = response.text?.trim() || "";
    // Clean up potential markdown formatting if Gemini still adds it
    const jsonStr = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
    
    const parsedData = JSON.parse(jsonStr);

    const responseData = {
      verdict: parsedData.verdict,
      isLowestPrice: parsedData.isLowestPrice,
      alternatives: parsedData.alternatives || [],
      bundleSavings: parsedData.bundleSavings || [],
      timestamp: new Date().toISOString()
    };

    if (process.env.UPSTASH_REDIS_REST_URL) {
      const redis = Redis.fromEnv();
      // Save to cache for 24 hours
      await redis.set(productKey, responseData, { ex: 86400 });
      // Increment user daily limit only if not logged in
      if (!userId) {
        await redis.incr(rateLimitKey);
        await redis.expire(rateLimitKey, 86400);
      }
    } else {
      memoryStore.set(productKey, responseData, 86400);
      if (!userId) {
        memoryStore.incrRateLimit(rateLimitKey, 86400);
      }
    }

    return NextResponse.json(responseData);

  } catch (error: any) {
    console.error('AI Deal Picker Error:', error);
    const errorMsg = error?.message || error?.toString() || '';
    if (errorMsg.includes('429') || errorMsg.includes('quota') || errorMsg.includes('rate')) {
      return NextResponse.json({ error: 'Rate limit exceeded. Please wait a few seconds and try again.' }, { status: 429 });
    }
    // Graceful failure - return 500 error instead of fake data
    return NextResponse.json({ error: 'Failed to generate AI insights', details: errorMsg }, { status: 500 });
  }
}
