import { NextResponse } from 'next/server';
import { rankProductsByRelevance } from '@/lib/searchRelevance';
export const dynamic = 'force-dynamic';
import { fetchValueSerpResults } from '@/lib/scrapers/valueserp';
import { searchTokens } from '@/lib/searchIntent';
import { validateEnvironment } from '@/lib/env';

// Startup validation to fail fast if required env vars are missing
validateEnvironment();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q')?.trim();

  if (!query) {
    return NextResponse.json({ error: 'Query parameter "q" is required' }, { status: 400 });
  }

  try {
    const results = await fetchValueSerpResults(query);

    if (!results.success) {
      const statusMap: Record<string, number> = {
        NO_RESULTS: 404,
        RATE_LIMIT: 429,
        API_ERROR: 502,
        PARSER_ERROR: 500,
      };
      const status = statusMap[results.error] || 500;
      return NextResponse.json({ success: false, error: results.error, products: [] }, { status });
    }

    const rankedProducts = rankProductsByRelevance(results.products, query);

    // Filter out completely irrelevant items (score < -50) if relevant items exist
    const relevantProducts = rankedProducts.filter(p => (p._score ?? 0) >= -50);
    const finalRanked = relevantProducts;

    if (finalRanked.length === 0) {
      return NextResponse.json([]);
    }

    const enriched = finalRanked.map(p => {
      // Compare only identical title specifications, not merely overlapping product names.
      const competitors = rankedProducts
        .filter(other => other.id !== p.id && searchTokens(p.title).sort().join(' ') === searchTokens(other.title).sort().join(' '))
        .map(c => ({ platform: c.platform, price: c.price, url: c.url }))
        .sort((a, b) => a.price - b.price)
        .slice(0, 3);

      return {
        ...p,
        competitors
      };
    });

    return NextResponse.json(enriched);
  } catch (error) {
    console.error('Search API Route Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

