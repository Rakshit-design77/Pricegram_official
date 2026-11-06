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
    const query = searchParams.get('q');

    if (!query) {
      return NextResponse.json({ error: 'Missing query' }, { status: 400 });
    }

    // 1. Freemium Rate Limiting (10 Smart Searches per day per IP)
    // BYPASS for authenticated (logged-in) users
    const { userId } = await auth();
    let currentUsage = 0;
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'anonymous';
    const rateLimitKey = `ai_smart_search_limit:${ip}`;
    
    if (!userId) {
      if (process.env.UPSTASH_REDIS_REST_URL) {
        const redis = Redis.fromEnv();
        currentUsage = await redis.get<number>(rateLimitKey) || 0;
      } else {
        currentUsage = memoryStore.getRateLimit(rateLimitKey);
      }

      if (currentUsage >= 10) {
        // Fallback to normal search silently instead of throwing error to keep UX smooth
        return NextResponse.json({ optimizedQuery: query, originalQuery: query });
      }
    }

    // 2. Query Caching (1 Hour)
    const queryKey = `ai_query:${Buffer.from(query).toString('base64')}`;
    let cachedData = null;
    if (process.env.UPSTASH_REDIS_REST_URL) {
      const redis = Redis.fromEnv();
      cachedData = await redis.get(queryKey);
    } else {
      cachedData = memoryStore.get(queryKey);
    }
    
    if (cachedData) {
      return NextResponse.json(cachedData);
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      // Fallback to original query if no API key
      return NextResponse.json({ optimizedQuery: query, originalQuery: query });
    }

    const prompt = `
      You are an expert e-commerce search optimizer.
      Your task is to take a natural language search query and extract structured data.
      
      User query: "${query}"

      Return a raw JSON object (no markdown formatting like \`\`\`json) with the following fields:
      1. "optimizedQuery": A clean, concise keyword-based query suitable for a standard e-commerce search engine (e.g. remove filler words, fix spelling).
      2. "maxPrice": If a budget is mentioned (e.g. "under 15k", "below 2000"), put the maximum number here (e.g. 15000). Otherwise, null.
      3. "category": If a specific category is obvious, provide it from this list: ["Grocery & Essentials", "Electronics", "Fashion", "Home & Kitchen", "Beauty", "Mobiles", "General"]. Otherwise, null.
    `;

    const response = await generateGeminiContent({
      contents: prompt,
    });

    const rawText = response.text?.trim() || "";
    const jsonStr = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
    let parsedData;
    
    try {
      parsedData = JSON.parse(jsonStr);
    } catch(e) {
      parsedData = { optimizedQuery: query, maxPrice: null, category: null };
    }

    const responseData = { 
      optimizedQuery: parsedData.optimizedQuery || query,
      maxPrice: parsedData.maxPrice || null,
      category: parsedData.category || null,
      originalQuery: query 
    };

    if (process.env.UPSTASH_REDIS_REST_URL) {
      const redis = Redis.fromEnv();
      await redis.set(queryKey, responseData, { ex: 3600 }); // 1 hour cache
      if (!userId) {
        await redis.incr(rateLimitKey);
        await redis.expire(rateLimitKey, 86400); // Daily limit
      }
    } else {
      memoryStore.set(queryKey, responseData, 3600);
      if (!userId) {
        memoryStore.incrRateLimit(rateLimitKey, 86400);
      }
    }

    return NextResponse.json(responseData);

  } catch (error: any) {
    console.error('AI Query Optimization Error:', error);
    const errorMsg = error?.message || error?.toString() || '';
    if (errorMsg.includes('429') || errorMsg.includes('quota') || errorMsg.includes('rate')) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }
    // Fail-safe: Always return the original query if AI fails
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    return NextResponse.json({ 
      optimizedQuery: query,
      originalQuery: query 
    });
  }
}
