// Run against your own running app, after configuring a working browser runtime.
const args = process.argv.slice(2);
const option = (name, fallback) => { const index = args.indexOf(name); return index >= 0 ? args[index + 1] : fallback; };
const pincode = option('--pincode');
const base = option('--base-url', 'http://localhost:3000');
const query = option('--query', 'milk');

async function main() {
  if (!pincode || !/^[1-9]\d{5}$/.test(pincode)) {
    throw new Error('Supply your actual delivery pincode: npm run test:quick-commerce:live -- --pincode YOUR_PINCODE');
  }
  let working = true;
  for (const platform of ['Blinkit', 'Zepto']) {
    const url = new URL('/api/search', base);
    url.search = new URLSearchParams({ q: query, pincode, platforms: platform, details: '1' }).toString();
    const response = await fetch(url, { signal: AbortSignal.timeout(55000) });
    const body = await response.json();
    const source = body.sources?.find(item => item.platform === platform);
    const products = Array.isArray(body.products) ? body.products : [];
    const success = response.ok && source?.status === 'success' && products.some(product => product.platform === platform);
    working &&= success;
    console.log(JSON.stringify({ platform, http: response.status, status: source?.status ?? 'unknown',
      stage: source?.stage ?? 'unknown', upstreamHttp: source?.httpStatus,
      products: products.length, version: response.headers.get('x-pricegram-search-version'),
      sample: products.slice(0, 3).map(({ title, price, stockStatus, url }) => ({ title, price, stockStatus, url })),
    }, null, 2));
  }
  if (!working) {
    console.error('Live grocery retrieval is NOT verified. Resolve the reported source status and rerun.');
    process.exitCode = 1;
  } else console.log('Both sources returned live products. Compare prices, pack sizes and stock with the stores before production use.');
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
