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
| Search sources | The active search path tries direct Amazon/Flipkart HTML parsing and a ScaleSERP fallback. Other scraper modules are also included. |
| API naming | `VALUESERP_API_KEY` is the variable used by the code, but its fallback request currently targets `api.scaleserp.com`. Confirm provider/key compatibility before enabling it. |
| Location | Pincode is stored in browser state; the active search endpoint does not pass it to the upstream provider. Local stock and delivery coverage are not guaranteed. |
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

Use Node.js 20.9 or newer and npm. Start from a Git clone so both collaborators share the same history:

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
| `VALUESERP_API_KEY` | Required by current startup validation; used for the ScaleSERP request described above. |
| `GEMINI_API_KEY` | Enables the optional AI tools. |
| `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | Configure together for shared caching/rate limits. Without Redis, the fallback is process-local. |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Reserved placeholders for future database integration. |
| Clerk sign-in/sign-up/redirect variables | Routes supplied in `.env.example`; match them to your Clerk configuration. |

Keep private credentials in `.env.local` or Vercel environment settings. The repository includes placeholders only. Environment validation currently executes when search modules load, so missing required keys can block builds as well as requests.

## Commands and checks

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development server with Turbopack. |
| `npm run build` | Create the production build; requires configured services/environment. |
| `npm start` | Serve a completed production build. |
| `node scripts/search-regression.cjs` | Run the 42 existing search relevance/intent assertions. |
| `npx tsc --noEmit --incremental false` | Run TypeScript checking. |
| `npm run lint` | Currently points to removed `next lint`; migrate to ESLint CLI and add a configuration before relying on it. |

The source snapshot is preserved for collaboration. Known setup problems are documented here rather than silently changed during the initial upload.

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

