const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { test } = require('node:test');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
const modules = new Map();
let providerResult;
let providerError;
let lastQuery;
let lastOptions;
let providerCalls = 0;

// Exercise the actual route with deterministic provider responses, without credentials/network.
function load(file) {
  if (modules.has(file)) return modules.get(file).exports;
  const mod = { exports: {} };
  modules.set(file, mod);
  const js = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  const requireModule = id => {
    if (id === '@/lib/productSearch') return {
      searchablePlatforms: ['Amazon', 'Flipkart', 'Blinkit', 'Zepto', 'Swiggy Instamart', 'BigBasket'],
      searchProducts: async (query, options) => {
        providerCalls++;
        lastQuery = query;
        lastOptions = options;
        if (providerError) throw providerError;
        return { products: providerResult.success ? providerResult.products : [], sources: [{ platform: 'Marketplace search', status: providerResult.success ? 'success' : providerResult.error === 'NO_RESULTS' ? 'empty' : 'unavailable', receivedCount: 0, matchedCount: 0, durationMs: 0 }] };
      },
    };
    if (id.startsWith('@/')) return load(path.join(root, 'src', id.slice(2)) + '.ts');
    if (id.startsWith('.')) return load(path.resolve(path.dirname(file), id) + '.ts');
    return require(id);
  };
  new Function('require', 'exports', 'console', js)(requireModule, mod.exports, { error() {} });
  return mod.exports;
}

const { prepareSearchResults: prepare } = load(path.join(root, 'src/lib/searchResults.ts'));
const { GET } = load(path.join(root, 'src/app/api/search/route.ts'));
function product(overrides = {}) {
  return {
    id: 'provider-id-collision', title: 'Mother Dairy Toned Milk 500ml', price: 30,
    mrp: 30, discount: 0, image: 'https://example.com/milk.jpg', platform: 'Flipkart',
    deliveryTime: 'Standard Delivery', deliveryFee: 0, stockStatus: 'In stock',
    url: 'https://www.flipkart.com/milk/p/example?pid=MILK500&q=milk&iid=ad1',
    category: 'Grocery & Essentials', ...overrides,
  };
}

test('rejects the actual coconut, pistachio and powder milk mismatches', () => {
  const bad = [
    'Green Magic Premium Coconut Milk coconut',
    'Bless BLESS MILK WITH ADDED PISTACHIO BEST FOR NUTRITION AND ENERGY',
    'Milklab Plant Based Almond Milk | 1 Liters | 100% Australian Almonds',
    'Nutra Vita Camel Milk Powder 240 Grams',
  ].map(title => product({ title }));
  for (const query of ['milk', 'toned milk']) {
    assert.deepEqual(prepare(bad, query), []);
    assert.equal(prepare([...bad, product()], query).length, 1);
  }
});

test('still permits explicitly requested coconut milk and jeans', () => {
  assert.equal(prepare([product({ title: 'Green Magic Coconut Milk' })], 'coconut milk').length, 1);
  assert.equal(prepare([product({ title: 'Denim Hawk Men Grey Jeans', category: 'Fashion' })], 'jeans').length, 1);
});

test('merges repeated offers with tracking/search parameters and differing provider IDs', () => {
  const results = prepare([
    product(),
    product({ id: 'different-source-id', url: 'https://www.flipkart.com/milk/p/example?iid=ad2&q=toned+milk&pid=MILK500&utm_source=ads' }),
  ], 'milk');
  assert.equal(results.length, 1);
  assert.equal(results[0].price, 30);
});

test('preserves different merchants, sizes, SKUs and sellers despite colliding provider IDs', () => {
  const offers = [
    product(),
    product({ platform: 'Blinkit', url: 'https://blinkit.com/prn/milk/prid/100' }),
    product({ title: 'Mother Dairy Toned Milk 1L', url: 'https://www.flipkart.com/milk/p/example?pid=MILK1000' }),
    product({ url: 'https://www.flipkart.com/milk/p/example?pid=MILK500&lid=SELLER2' }),
  ];
  const results = prepare(offers, 'milk');
  assert.equal(results.length, 4);
  assert.equal(new Set(results.map(p => p.id)).size, 4);
  assert.equal(prepare([...offers].reverse(), 'milk').find(p => p.platform === 'Blinkit').id,
    results.find(p => p.platform === 'Blinkit').id);
});

test('rejects invalid prices and unusable product links', () => {
  for (const price of [0, -1, NaN, Infinity, '30']) assert.deepEqual(prepare([product({ price })], 'milk'), []);
  for (const url of ['', 'broken-url', 'javascript:alert(1)']) assert.deepEqual(prepare([product({ url })], 'milk'), []);
});

test('route validates blank queries before calling any provider', async () => {
  const callsBefore = providerCalls;
  const response = await GET(new Request('http://localhost/api/search?q=%20'));
  assert.equal(response.status, 400);
  assert.equal(providerCalls, callsBefore);
  assert.equal(response.headers.get('x-pricegram-search-version'), 'quick-commerce-v1');
});

test('route filters and deduplicates before building cross-merchant competitors', async () => {
  providerError = undefined;
  providerResult = { success: true, products: [
    product(), product(),
    product({ platform: 'Blinkit', url: 'https://blinkit.com/prn/milk/prid/100' }),
    product({ title: 'Green Magic Premium Coconut Milk coconut' }),
  ] };
  const response = await GET(new Request('http://localhost/api/search?q=%20toned%20milk%20'));
  assert.equal(response.status, 200);
  assert.equal(lastQuery, 'toned milk');
  assert.equal(response.headers.get('cache-control'), 'no-store');
  const products = await response.json();
  assert.equal(products.length, 2);
  assert.equal(new Set(products.map(p => p.id)).size, 2);
  assert.ok(products.every(p => Number.isFinite(p._score)));
  assert.ok(products.every(p => p.competitors.length === 1 && p.competitors[0].platform !== p.platform));
});

test('route returns a consistent empty array when no candidates match', async () => {
  providerResult = { success: true, products: [product({ title: 'Green Magic Coconut Milk' })] };
  const response = await GET(new Request('http://localhost/api/search?q=milk'));
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), []);
});

test('route distinguishes an empty search from provider failures', async () => {
  for (const [error, status] of [['NO_RESULTS', 200], ['API_ERROR', 503], ['RATE_LIMIT', 503], ['PARSER_ERROR', 503]]) {
    providerResult = { success: false, error, products: [] };
    const response = await GET(new Request('http://localhost/api/search?q=milk'));
    assert.equal(response.status, status);
    const body = await response.json();
    if (error === 'NO_RESULTS') assert.deepEqual(body, []);
    else assert.equal(body.error, 'SOURCES_UNAVAILABLE');
  }
});

test('route hides unexpected internal errors and keeps its version marker', async () => {
  providerError = new Error('private upstream diagnostic');
  const response = await GET(new Request('http://localhost/api/search?q=milk'));
  assert.equal(response.status, 500);
  assert.equal(response.headers.get('x-pricegram-search-version'), 'quick-commerce-v1');
  assert.deepEqual(await response.json(), { error: 'Internal Server Error' });
  providerError = undefined;
});

test('route forwards pincode and requested stores and supports the detailed response contract', async () => {
  providerError = undefined;
  providerResult = { success: true, products: [product()] };
  const response = await GET(new Request('http://localhost/api/search?q=milk&pincode=201310&platforms=Blinkit,Zepto&details=1'));
  assert.equal(response.status, 200);
  assert.deepEqual(lastOptions, { location: { pincode: '201310' }, platforms: ['Blinkit', 'Zepto'] });
  const body = await response.json();
  assert.equal(body.products.length, 1);
  assert.equal(body.sources.length, 1);
});

test('route rejects invalid location or store filters before fetching providers', async () => {
  const before = providerCalls;
  for (const suffix of ['pincode=000000', 'lat=28', 'platforms=Unknown', 'q=' + 'a'.repeat(201)]) {
    const response = await GET(new Request('http://localhost/api/search?' + (suffix.startsWith('q=') ? suffix : 'q=milk&' + suffix)));
    assert.equal(response.status, 400);
  }
  assert.equal(providerCalls, before);
});
