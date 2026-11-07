import { NextResponse } from 'next/server';
import { prepareSearchResults } from '@/lib/searchResults';
export const dynamic = 'force-dynamic';
import { searchProducts, searchablePlatforms } from '@/lib/productSearch';
import { searchTokens } from '@/lib/searchIntent';
import { locationFromParams } from '@/lib/deliveryLocation';

export const runtime = 'nodejs';
export const maxDuration = 60;

function jsonResponse(body: unknown, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: {
      'Cache-Control': 'no-store',
      'X-PriceGram-Search-Version': 'quick-commerce-v1',
    },
  });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q')?.trim();

  if (!query) {
    return jsonResponse({ error: 'Query parameter "q" is required' }, 400);
  }
  if (query.length > 200) return jsonResponse({ error: 'Search queries must be 200 characters or fewer.' }, 400);
  let location;
  try { location = locationFromParams(searchParams); }
  catch (error) { return jsonResponse({ error: (error as Error).message }, 400); }
  const platforms = [...new Set((searchParams.get('platforms') || '').split(',').map(value => value.trim()).filter(Boolean))];
  if (platforms.some(platform => !searchablePlatforms.includes(platform))) {
    return jsonResponse({ error: 'Unknown platform filter.' }, 400);
  }

  try {
    const results = await searchProducts(query, { location, platforms });
    if (!results.products.length && results.sources.length &&
      results.sources.every(source => source.status !== 'success' && source.status !== 'empty')) {
      const missingLocation = results.sources.every(source => source.status === 'location_required');
      return jsonResponse({ error: missingLocation ? 'LOCATION_REQUIRED' : 'SOURCES_UNAVAILABLE', products: [], sources: results.sources }, missingLocation ? 400 : 503);
    }

    const rankedProducts = prepareSearchResults(results.products, query);

    const enriched = rankedProducts.map(p => {
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

    // Existing callers keep the array contract; the search UI requests provider diagnostics.
    return jsonResponse(searchParams.get('details') === '1' ? { products: enriched, sources: results.sources } : enriched);
  } catch (error) {
    console.error('Search API Route Error:', error);
    return jsonResponse({ error: 'Internal Server Error' }, 500);
  }
}

