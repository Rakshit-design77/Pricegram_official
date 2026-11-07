# Blinkit and Zepto integration

The search route calls independent Blinkit and Zepto adapters. They use fresh browser contexts, select the requested location through the store UI, read product cards, and verify that the same location remains selected. They never log in, add items, or place orders. They do not solve CAPTCHAs or bypass access restrictions.

## Runtime setup

### Local development

Install Google Chrome and run the app from your own terminal. The adapters use Puppeteer's local Chrome channel by default. If Chrome is elsewhere, set its full executable path in `.env.local`:

```env
PUPPETEER_EXECUTABLE_PATH=C:\Program Files\Google\Chrome\Application\chrome.exe
```

Use Node.js 22.17 or newer and install the updated lockfile with `npm ci --legacy-peer-deps`. Puppeteer Core 24.42 and serverless Chromium 147 are pinned as production dependencies. The page UI still needs the Clerk credentials described in the main README.

`npm run dev` and `npm run build` use Webpack. The local Turbopack run hit an external-package junction error when loading Puppeteer in this Windows/OneDrive workspace. Browser packages are external server dependencies; binary assets are explicitly included by Next.js file tracing for `/api/search`.

### Vercel

The default Vercel path launches the included `@sparticuz/chromium` Linux runtime with `puppeteer-core`. No separate browser-service account or token is needed for this path. Browser extraction is shared within an instance, while each shopper uses an isolated context. Pinning the browser major avoids an arbitrary mismatch with Puppeteer's supported Chrome version. Validate the function bundle size and memory usage on deployment; the browser binary assets occupy about 68 MB before runtime extraction.

A hosted browser can optionally replace that local function runtime. Configure its trusted CDP WebSocket endpoint in the Vercel environment:

```env
QUICK_COMMERCE_BROWSER_WS_ENDPOINT=wss://YOUR_BROWSER_SERVICE/YOUR_ENDPOINT
```

For that optional mode, use the exact endpoint from the browser service; it may contain a secret token. Do not expose it through a `NEXT_PUBLIC_` variable, commit it, or paste it into application logs. The service must support Puppeteer `connect` and isolated browser contexts. Each request closes its own context and disconnects; it does not shut down a hosted shared browser.

Chromium launch failure reports `browser_unavailable`. Either runtime also needs working access to the target storefront: configuring a browser alone does not guarantee that Blinkit or Zepto will accept the connection. If the store denies automated access, use an authorized inventory provider instead. Vercel builds can set `PUPPETEER_SKIP_DOWNLOAD=true` to skip the older full Puppeteer dependency's unnecessary Chrome download; the grocery runtime uses the pinned serverless binary instead.

## Location and UI behavior

- The selected pincode is passed to the source adapters, with no hardcoded replacement.
- "Use Current Location" now uses the actual browser coordinates instead of the old simulated Noida location.
- Selecting a manual pincode clears any earlier GPS coordinates.
- New visitors choose their location explicitly. The earlier implicit 201310 preference is cleared during storage migration so it can be confirmed. Manual selection or closing the picker invalidates pending GPS callbacks.
- After saved preferences hydrate, the site automatically opens a required location dialog if no valid location is saved. Searches wait until that choice is made. Returning visitors keep their chosen location and can change it from the header.
- A pincode may be too broad for a store's delivery catchment. The adapter requires a matching location suggestion and a committed location; otherwise it reports `location_unavailable`. GPS can provide a more precise location.
- Changing the location or platform filters reissues the search.
- Unavailable sources are identified in the results page, with direct store links. Failed sources do not discard results from working sources.
- The UI does not display browser-service settings or secret details.
- Product results retain the existing image-card layout. Source failures show an inline message and retry action, without outbound store-search fallback links. The product card's Buy button still opens the specific merchant offer.
- Grocery queries, including Frooti and mango drinks, bypass general ScaleSERP snippets. Direct Amazon/Flipkart results and the direct Blinkit/Zepto adapters supply products. Lazy-loaded grocery image attributes are supported; absent images remain an explicit limitation rather than a fabricated product photo.

## API contract

Examples:

```text
/api/search?q=milk&pincode=201310&details=1
/api/search?q=milk&lat=28.47&lon=77.51&platforms=Blinkit,Zepto&details=1
```

`details=1` returns `{ products, sources }`. For backward compatibility, successful requests without that parameter still return the product array. The response header `X-PriceGram-Search-Version: quick-commerce-v1` identifies this path.

Each source includes its platform, status, received/matched counts and duration. Grocery diagnostics also include the execution `stage` (`browser`, `storefront`, `location`, `search`, `parse`, or `verify_location`) and an upstream `httpStatus` when applicable. No browser endpoint, credentials, address or coordinates are included. Statuses distinguish success, a genuine empty result, missing/unconfirmed location, blocked requests, timeout, browser runtime failure, parsing failure, temporary capacity limits, `store_unavailable` (closed/maintenance), and other unavailability.

When all requested sources fail, the route returns HTTP 503 with `{ error: "SOURCES_UNAVAILABLE", products: [], sources }`. If the only requested sources need a location, it returns HTTP 400 and `LOCATION_REQUIRED`. A genuine no-match result is HTTP 200. A Blinkit-only request does not fall back to unrelated Flipkart listings. Search-engine snippets labelled Blinkit/Zepto are excluded from marketplace fallback data because they are not verified local inventory.

The browser operation has a 45-second overall deadline, shorter per-step limits, and a limit of two active grocery browser operations per server process. Cleanup can delay the response by at most another 1.5 seconds; capacity stays reserved until cleanup finishes. Source failures are logged by code without endpoint URLs, location coordinates, tokens or HTML. Multi-instance quotas and shared caching remain future scaling work.

## Data guarantees

Parsers retain pack sizes, decimal prices and actual product links. Missing MRP defaults to the price with zero discount. Missing reviews are omitted, unknown stock is marked `Unknown`, and unverified delivery fees are marked unknown. Product IDs and deduplication are handled by the shared search-result pipeline.

Selectors and DOM decisions are isolated in `quickCommerceProducts.ts` and `quickCommerceDom.ts`; `quickCommerceBrowser.ts` orchestrates browser actions. Store markup changes can require adapter updates. A card-parsing failure is an error, not proof that the store has no stock. Prices are browsing snapshots, not a guarantee of checkout price or delivery availability at an exact address.

## Validation and current limitations

Run `npm run test:search` and `npm run typecheck`. Tests cover parsing, location validation/forwarding, adapter wiring, source selection, partial failures, response contracts, browser cleanup, and the actual production navigation flow against a DOM harness. The reduced fixtures in `scripts/fixtures` preserve markup inspected on the live storefronts; they are explicitly static test data. `linkedom` is a development-only test dependency. These tests do not launch real Chromium or prove production network access.

### Live investigation, 7 November 2026

- **Blinkit:** In the in-app browser, manually selecting the first matching 201310 suggestion committed `Noida, Uttar Pradesh 201310, India`. Searching `toned milk` returned Amul Taaza Toned Milk 500 ml at ₹30 and Mother Dairy Toned Milk 1 ltr at ₹60. Blinkit's read-only storefront tool independently reported those items and marked the anonymous session's prices as indicative. The location persisted when returning to the home page.
- **Zepto:** Selecting 201310 committed the Pocket B area and displayed `Store Under Maintenance`, even though catalogue cards had ADD buttons. Selecting 201301 instead committed C Block and, after the store finished updating, displayed a 13-minute estimate with milk cards. One observed card was Amul Taaza Toned Fresh Milk, 1 pack (500 ml), ₹23 with ₹30 MRP. These observations establish storefront behavior in those browser sessions, not a promise of current stock.
- **Old deployed PriceGram API:** Separate Blinkit-only and Zepto-only requests for `toned milk`, pincode 201310, returned HTTP 200 with two unrelated merchant results (Justdial and Sohandryfruitandgeneralstores), an array body, and no search-version header or provider diagnostics. That deployment was still serving the earlier search behavior.
- **Updated local PriceGram API:** Both selected-source calls returned HTTP 503, `browser_unavailable`, stage `browser`, with no unrelated fallback products. Launching installed Chrome still failed with process code 2147483651 in this execution environment. The in-app inspection browser is separate from the app's Puppeteer runtime. No hosted browser provider is configured; Linux/Vercel Chromium has not been executed here.

### Fixes from the live investigation

- Handle Blinkit's app prompt and `Select manually` step, including clickable div controls.
- Select complete suggestion rows in source order, matching the requested postcode; support Zepto's `address-search-item` attribute. Never choose the shortest nested postcode label or substitute another postcode.
- Wait for asynchronous confirmation and a settled address; reject a location while its detection/confirmation dialog is still open.
- Parse Blinkit's current `tw-*` product name/quantity classes and strikethrough MRP. Parse Zepto's `ProductName`, `PackSize`, and `EdlpPrice` slots. Honor explicit sold-out state and disabled ADD buttons.
- Require the search result heading to match the query, so a preloaded default grid cannot be mistaken for completed results.
- Detect store closure/maintenance and access challenges separately from empty search results.
- Blinkit's current search layout omits its location header. After reading its cards, verify the same session's location on the home page; discard the products if it changed or disappeared.

**Remaining verification:** The local adapters have not yet returned products through a real Puppeteer runtime in this environment. A full end-to-end success in a working local terminal or Vercel preview is still required. The Linux runtime is covered by configuration tests, not a real Linux launch here. No deployment is performed by running the tests.

Final local checks: 92 automated checks passed (42 search-intent checks, 12 API/result tests, and 38 grocery/parser/DOM/lifecycle tests). TypeScript passed. The production build compiled and completed its TypeScript stage, then failed while prerendering `/about` because the local Clerk publishable key is missing. This is not a successful full build. No credentials were fabricated or added, and no changes were pushed or deployed.

After configuring a working runtime, check both stores separately at a real serviceable location, compare the returned product, pack size, price and stock with the store, then test the combined request. Require `success` with verified products before calling either source operational.

With `npm run dev` running in one terminal, use another terminal:

```powershell
npm run test:quick-commerce:live -- --pincode YOUR_PINCODE
```

Replace `YOUR_PINCODE` with the shopper's delivery pincode. Use `--base-url http://127.0.0.1:3100` for a different local port. The live check fails explicitly unless both stores return products; it never counts a blocked browser or empty fixture response as a successful integration.
