# PriceGram

**Sabse Sasta, Sabse Tez** — a shopping price comparison app for the Indian market.

[Live website](https://pricegram-eight.vercel.app/) · [GitHub repository](https://github.com/Rakshit-design77/Pricegram_official)

PriceGram brings product search, merchant offers, filters, and AI shopping tools into one interface. Its homepage introduces grocery and e-commerce comparison across platforms such as Amazon, Flipkart, Blinkit, Zepto, Swiggy Instamart, and BigBasket. Actual coverage and freshness depend on the upstream results available for each search.

## What is included

- Product search with relevance ranking and checks for product type, brand, variants, and budget.
- Grid and list search results, platform/category filters, a price ceiling, and sorting.
- Product detail views with merchant links and available competitor offers.
- Optional Gemini-powered query optimization, deal insights, and Smart Cart recommendations.
- A persistent local shopping cart, wishlist, recent searches, and pincode preference.
- Clerk sign-in/sign-up pages and account UI.
- Dashboard, coupons, blog, premium, admin, about, privacy, terms, and disclaimer pages.
- Responsive layouts, dark/light themes, and a web app manifest.

## Current implementation status

The live homepage is available, but its marketing copy describes some capabilities beyond the current source implementation.

| Area | Current source behavior |
| --- | --- |
| Search sources | Amazon/Flipkart and ScaleSERP fallback run alongside location-aware Blinkit/Zepto browser adapters. The grocery adapters require a working browser runtime; live retrieval has not yet been verified. |
| API naming | `VALUESERP_API_KEY` is the variable used by the code, but its fallback request currently targets `api.scaleserp.com`. Confirm provider/key compatibility before enabling it. |
| Location | Selected pincode or real GPS coordinates are forwarded to Blinkit/Zepto. An unconfirmed location is reported as a failure; marketplace sources retain their existing location behavior. |
| Price history | The chart generates illustrative historical values; it is not a stored historical price feed. |
| Premium | Checkout is simulated and premium status is stored in localStorage. There is no real payment or server-side subscription enforcement. |
| Admin | The admin interface uses sample data and local component state. It has no production admin authorization or persistence. |
| Alerts | Some alert UI is present, but automated email/WhatsApp delivery is not implemented as a complete backend service. |
| Supabase | The dependency and environment placeholders are included; the current source does not implement a Supabase-backed data layer. |
| Offer accuracy | Some parser defaults supply estimated ratings, delivery details, or discounts. Verify merchant checkout details before treating these as factual. |
| Authentication | Clerk components and server auth calls exist, but this snapshot does not include Clerk middleware/proxy configuration. |

## Technology

- Next.js 16 App Router, React 19, and TypeScript
- Tailwind CSS, shadcn-style/Radix UI components, Lucide icons
- Zustand persistence, Framer Motion, Recharts
- Clerk authentication
- Google Gen AI SDK
- Cheerio and Puppeteer scraping utilities
- Optional Upstash Redis cache/rate limits, with an in-memory fallback
- Vercel hosting for the linked live deployment

Versions are defined by `package.json` and `package-lock.json`.

## Local development

Use Node.js 22.17 or newer (Node.js 24 recommended) and npm. Start from a Git clone so both collaborators share the same history:

```bash
git clone https://github.com/Rakshit-design77/Pricegram_official.git
cd Pricegram_official
npm ci --legacy-peer-deps
```

The legacy peer flag is currently needed because packages such as `cmdk@1.0.0` and `react-day-picker@8` have peer dependency ranges that conflict with React 19. This is a compatibility workaround; dependency alignment remains follow-up work.

Create `.env.local` from `.env.example`:

```powershell
Copy-Item .env.example .env.local
```

On macOS/Linux, use `cp .env.example .env.local`. Replace placeholder values with your own service credentials, then run:

```bash
npm run dev
```

Open [localhost:3000](http://localhost:3000).

### Environment variables

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk browser configuration; required by the current app setup. |
| `CLERK_SECRET_KEY` | Clerk server authentication; required by current environment validation. |
| `VALUESERP_API_KEY` | Enables the ScaleSERP fallback described above. Direct product search can run without it; the existing AI-route validation still expects it. |
| `GEMINI_API_KEY` | Enables the optional AI tools. |
| `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | Configure together for shared caching/rate limits. Without Redis, the fallback is process-local. |
| `QUICK_COMMERCE_BROWSER_WS_ENDPOINT` | Optional private hosted Chromium CDP endpoint. Vercel otherwise uses the included serverless Chromium runtime; no separate browser account is required for that path. |
| `PUPPETEER_EXECUTABLE_PATH` | Optional local Chrome executable path; development otherwise uses the installed Chrome channel. |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Reserved placeholders for future database integration. |
| Clerk sign-in/sign-up/redirect variables | Routes supplied in `.env.example`; match them to your Clerk configuration. |

Keep private credentials in `.env.local` or Vercel environment settings. The repository includes placeholders only. The search endpoint no longer requires unrelated Clerk credentials at module load. Clerk is still needed for the account UI and a full production build; the AI routes retain their existing environment checks.

## Commands and checks

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development server with Webpack (avoids the Puppeteer external-package junction error observed with Turbopack in this OneDrive workspace). |
| `npm run build` | Create the production build; requires configured services/environment. |
| `npm start` | Serve a completed production build. |
| `node scripts/search-regression.cjs` | Run the 42 existing search relevance/intent assertions. |
| `npm run test:search` | Run search, API, grocery-parser, location and provider-isolation regression checks. These use fixtures/mocked providers and do not prove live merchant coverage. |
| `npm run typecheck` | Run TypeScript checking without writing incremental build metadata. |
| `npx tsc --noEmit --incremental false` | Run TypeScript checking. |
| `npm run lint` | Currently points to removed `next lint`; migrate to ESLint CLI and add a configuration before relying on it. |

### First search reliability pass

The search API filters candidates through the intent rules, removes duplicate offers, and assigns stable IDs that distinguish merchants and variants. Empty searches return `200 []`; reported provider failures retain error status codes. Responses include `X-PriceGram-Search-Version: quick-commerce-v1` and `Cache-Control: no-store` so the updated execution path can be checked after deployment.

The search page cancels superseded requests, clears old results, refreshes query-derived filters, and shows an error/retry action for failed requests. Upstream fetches have timeouts. Some lower-level scraper failures still collapse into empty results; full per-provider diagnostics remain follow-up work.

### Blinkit/Zepto integration

Both adapters are now wired into search with selected location, isolated browser sessions, bounded execution, provider diagnostics, and partial-result handling. The search page requests detailed responses and displays unavailable sources. The current response version is `quick-commerce-v1`.

The included Chromium 147 runtime is pinned to the installed Puppeteer Core 24.42 browser major for Linux/Vercel. Local development uses installed Chrome; a hosted endpoint is optional. Live storefront inspection confirmed milk listings and exposed markup/location-flow changes, now covered by regression tests. The app's Puppeteer runtime still cannot launch Chrome in the execution sandbox, so automated end-to-end retrieval remains unverified. See [the setup and validation guide](docs/quick-commerce.md) for observed results, fixes, runtime configuration and remaining checks. Local changes do not deploy themselves to Vercel. ScaleSERP search mode remains unchanged.

## Project structure

```text
src/
  app/                 Pages, layouts, styles, and API route handlers
    api/search/        Product search and competitor enrichment
    api/ai/            Deal insights, query optimization, cart optimization
  components/          Home, search, product, cart, layout, and UI components
  hooks/               Shared React hooks
  lib/                 Search intent/ranking, AI, cache, environment, scrapers
  store/               Persistent app and cart state
  types/               Product and search result types
public/                Merchant logos and manifest
scripts/               Search regression checks
scratch/               Development experiments and scraper diagnostics
sample_result.json     Saved example response
valueserp_test.json    Saved provider response fixture
ROADMAP.md             Earlier planning notes
TASKS.md               Earlier task notes
ZIP-SETUP.txt          Notes accompanying the imported source archive
```

Planning files and archive notes are historical context; check the code and this README for current behavior.

## Working together

Use a separate branch for each change:

```bash
git switch main
git pull --ff-only origin main
git switch -c feature/short-description
# Make changes and run the relevant checks.
git add .
git commit -m "Describe the change"
git push -u origin feature/short-description
```

Open a pull request for the other collaborator to review. Commit the lockfile when dependencies change; do not commit local credentials, dependency folders, build artifacts, or deployment metadata.

## Deployment

The existing site is hosted at [pricegram-eight.vercel.app](https://pricegram-eight.vercel.app/). To deploy this repository, connect it in Vercel using the Next.js preset, configure the required environment variables, and select the desired production branch. The existing deployment's repository linkage has not been verified; uploading this repository alone does not establish a Vercel integration.

Before production changes, address dependency compatibility, Clerk request handling, reliable upstream error/timeouts, real price/history data, and server-backed payments/alerts/admin controls.

## License

No license file is included. Agree on licensing with the repository owner before redistributing or reusing the project outside the collaboration.

