# PriceGram SaaS Product Roadmap

Our vision is to build India's premier pincode-aware price comparison ecosystem, covering local brick-and-mortar stores alongside digital commerce giants.

---

## Phase 1: Core Consolidation (Q3 2026)
### Real-Time Scraping & Geo-Fencing
- **Micro-Targeted Scraping**: Improve Blinkit, Instamart, and Zepto scraping models to adjust stock and prices dynamically based on the exact 6-digit Indian pincode.
- **Aggregated Search Engine**: Complete fallback parsing logic to scrape competitor stores if ValueSerp API has cached results.

### User engagement & Alerts
- **Official WhatsApp Business API Integration**: Migrate from simulated SMS/SMTP updates to structured messaging alerts on WhatsApp.
- **Smart Push Notifications**: PWA browser notifications on price drops.

---

## Phase 2: Native App Expansion & Advanced Features (Q4 2026)
### Mobile Apps (React Native)
- **PWA to App Store**: Package web application assets into iOS and Android frameworks.
- **Barcode & QR Scanner**: Allow users to scan any grocery item barcode in a local supermarket (Reliance Smart, D-Mart) and instantly see if it is cheaper on Blinkit or Amazon.

### AI Co-Pilot Recommendation Engine
- **Shopping Basket Optimization**: Allow users to upload an entire shopping list (e.g., milk, bread, detergent, tea). The AI analyzes combination prices across Blinkit, Zepto, and Instamart to advise: *"Buy items 1 & 2 on Blinkit, and 3 & 4 on Zepto to save ₹120 overall."*

---

## Phase 3: Monetization & B2B APIs (Q1 2027)
### Advanced Partner Portals
- **Sponsored Bids**: Allow direct local and D2C brands to bid for banner spaces or top-of-search listings.
- **PriceGram Developer APIs**: Open-source API channels to let third-party developers fetch pricing history and aggregate listings under a paid token subscription.
