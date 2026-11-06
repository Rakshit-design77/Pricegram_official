import { NextResponse } from 'next/server';
import { generateGeminiContent } from '@/lib/gemini';
import { validateEnvironment } from '@/lib/env';
import { Redis } from '@upstash/redis';
import { memoryStore } from '@/lib/memoryCache';
import { auth } from '@clerk/nextjs/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { items } = body;

    if (!items || !Array.isArray(items) || items.length < 2) {
      return NextResponse.json({ error: 'At least 2 items are required for bundle optimization' }, { status: 400 });
    }

    // 1. Freemium Rate Limiting (5 Cart Optimizations per day per IP)
    // BYPASS for authenticated (logged-in) users
    const { userId } = await auth();
    let currentUsage = 0;
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'anonymous';
    const rateLimitKey = `ai_cart_optimizer_limit:${ip}`;

    if (!userId) {
      if (process.env.UPSTASH_REDIS_REST_URL) {
        const redis = Redis.fromEnv();
        currentUsage = await redis.get<number>(rateLimitKey) || 0;
      } else {
        currentUsage = memoryStore.getRateLimit(rateLimitKey);
      }

      if (currentUsage >= 5) {
        return NextResponse.json({ 
          error: 'Freemium limit reached. Upgrade to Premium for unlimited Smart Cart optimizations.',
          isFreemiumLimit: true
        }, { status: 403 });
      }
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'AI API Key is missing.' }, { status: 500 });
    }

    // Prepare prompt payload
    const cartPayload = items.map((i, idx) => `
Item ${idx + 1}:
Title: ${i.title}
Price: ₹${i.price}
Platform: ${i.platform}
Category: ${i.category}
Delivery: ${i.deliveryTime}
`).join('\n');

    const prompt = `
You are an expert Indian E-commerce Bundle Optimizer. 
The user has added the following items to their Smart Cart:

${cartPayload}

Analyze the cart and provide an optimization report. 
Focus on:
1. Shipping/Platform Optimization (e.g. if buying from 3 different platforms, is there a benefit to buying all from one to save shipping/time?)
2. Compatibility (e.g. did they buy an iPhone cover for a Samsung phone?)
3. Price drops (Are these items usually bought together cheaper elsewhere?)

Return ONLY a valid JSON object strictly matching this structure:
{
  "recommendation": "A short, enthusiastic 2-3 sentence paragraph summarizing your best bundle advice.",
  "totalSavings": 150, // Number in Rupees representing potential extra savings by following your advice. Put 0 if no extra savings.
  "warnings": ["Warning 1", "Warning 2"], // Array of strings. E.g. compatibility issues or high shipping costs. Empty array if none.
  "suggestedAction": "Buy all from Amazon for fastest delivery" // Short action phrase
}
No markdown formatting or extra text. ONLY raw JSON.`;

    const response = await generateGeminiContent({
      contents: prompt,
      config: {
        temperature: 0.2,
      }
    });

    const textResult = response.text || "{}";
    const cleanedJson = textResult.replace(/```json/g, '').replace(/```/g, '').trim();
    
    let parsedData;
    try {
      parsedData = JSON.parse(cleanedJson);
    } catch (e) {
      console.error("Failed to parse cart optimization:", cleanedJson);
      throw new Error("AI returned invalid format");
    }

    const responseData = {
      recommendation: parsedData.recommendation || "Your cart looks good!",
      totalSavings: parsedData.totalSavings || 0,
      warnings: parsedData.warnings || [],
      suggestedAction: parsedData.suggestedAction || "Proceed to checkout"
    };

    // Increment Usage
    if (!userId) {
      if (process.env.UPSTASH_REDIS_REST_URL) {
        const redis = Redis.fromEnv();
        await redis.incr(rateLimitKey);
        await redis.expire(rateLimitKey, 86400); // Daily limit
      } else {
        memoryStore.incrRateLimit(rateLimitKey, 86400);
      }
    }

    return NextResponse.json(responseData);

  } catch (error: any) {
    console.error('Smart Cart AI Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to optimize cart' }, { status: 500 });
  }
}
