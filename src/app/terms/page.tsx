export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl space-y-6">
      <h1 className="text-3xl font-black uppercase tracking-tight">Terms of Service</h1>
      <p className="text-xs text-muted-foreground font-bold uppercase">Last Updated: June 7, 2026</p>

      <div className="space-y-4 text-sm text-foreground/80 leading-relaxed font-semibold">
        <p>
          Welcome to PriceGram. By accessing our platform, you agree to comply with and be bound by the following terms and conditions.
        </p>

        <h3 className="text-lg font-bold text-foreground pt-2">1. Acceptable Use</h3>
        <p>
          PriceGram compiles pricing and delivery info for personal use. Users may not automate data retrieval, scrape, or extract listing grids in bulk for competitive redistribution without explicit written authorization.
        </p>

        <h3 className="text-lg font-bold text-foreground pt-2">2. Accuracy of Listings</h3>
        <p>
          Prices, stocks, coupons, and shipping fee estimates are fetched in real-time or estimated based on caching. We cannot guarantee that details will match the final retailer rates upon click-through.
        </p>

        <h3 className="text-lg font-bold text-foreground pt-2">3. Monetization & Affiliation</h3>
        <p>
          PriceGram participates in affiliate marketing programs, earning commission commissions from links followed to partner shops (e.g., Amazon Associates program).
        </p>

        <p className="pt-4 text-xs text-muted-foreground font-normal">
          Questions regarding service terms should be directed to support@pricegram.app.
        </p>
      </div>
    </div>
  );
}
