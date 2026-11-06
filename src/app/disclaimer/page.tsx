export default function DisclaimerPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl space-y-6">
      <h1 className="text-3xl font-black uppercase tracking-tight">Disclaimer</h1>
      <p className="text-xs text-muted-foreground font-bold uppercase">Last Updated: June 7, 2026</p>

      <div className="space-y-4 text-sm text-foreground/80 leading-relaxed font-semibold">
        <p>
          All information on PriceGram is published in good faith and for general comparison purposes only.
        </p>

        <h3 className="text-lg font-bold text-foreground pt-2">1. Price Fluctuations</h3>
        <p>
          Quick commerce and e-commerce prices change dynamically based on geolocation, time of day, demand, and local dealer stocking. PriceGram does not warrant that prices shown on our site will be identical to the checkout prices of the vendor.
        </p>

        <h3 className="text-lg font-bold text-foreground pt-2">2. Liability</h3>
        <p>
          PriceGram is not responsible for any transaction issues, product defects, or delivery delays originating from retail partners. Purchases are made entirely at your own risk on the retailer's platform.
        </p>

        <h3 className="text-lg font-bold text-foreground pt-2">3. Affiliate Relationship</h3>
        <p>
          We receive financial compensation through affiliate links. This does not increase the purchase price for the user.
        </p>
      </div>
    </div>
  );
}
