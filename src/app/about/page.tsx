import { ShieldCheck, Zap, Globe, Heart } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="space-y-6 text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-black tracking-tight uppercase">
            Our Mission: <span className="text-primary">Transparent Shopping</span>
          </h1>
          <p className="text-xl text-muted-foreground font-medium max-w-2xl mx-auto italic">
            "We don't sell products. We compare them to make sure you never overpay."
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          <div className="bg-card p-8 rounded-3xl border shadow-sm space-y-4 hover:border-primary/30 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold">Absolute Neutrality</h3>
            <p className="text-muted-foreground leading-relaxed">
              PriceGram is an independent comparison engine. We are not owned by any retailer, ensuring you always get the most unbiased price data available in the market.
            </p>
          </div>

          <div className="bg-card p-8 rounded-3xl border shadow-sm space-y-4 hover:border-primary/30 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500">
              <Zap className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold">Real-Time Precision</h3>
            <p className="text-muted-foreground leading-relaxed">
              While other sites use cached data, our engine fetches prices in real-time from Amazon, Flipkart, Blinkit, and more, capturing lightning deals as they happen.
            </p>
          </div>

          <div className="bg-card p-8 rounded-3xl border shadow-sm space-y-4 hover:border-primary/30 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <Globe className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold">Indian Market Focus</h3>
            <p className="text-muted-foreground leading-relaxed">
              Built specifically for the diverse Indian ecosystem, from major e-commerce giants to 10-minute delivery services like Zepto and Blinkit.
            </p>
          </div>

          <div className="bg-card p-8 rounded-3xl border shadow-sm space-y-4 hover:border-primary/30 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500">
              <Heart className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold">User-First Engineering</h3>
            <p className="text-muted-foreground leading-relaxed">
              Our algorithms prioritize your savings over merchant commissions. If a product is cheaper on a smaller platform, we'll tell you.
            </p>
          </div>
        </div>

        <div className="bg-[#050505] text-white p-10 md:p-16 rounded-[2rem] relative overflow-hidden text-center">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-primary/10 blur-[100px] pointer-events-none" />
          <h2 className="text-3xl md:text-4xl font-black mb-6 uppercase tracking-tight relative z-10">
            Saving India <span className="text-primary">Billions</span>
          </h2>
          <p className="text-gray-400 text-lg mb-8 max-w-xl mx-auto relative z-10">
            Every day, thousands of shoppers use PriceGram to avoid overpaying. Join the movement for a more transparent Indian e-commerce landscape.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
             <div className="bg-white/5 border border-white/10 px-6 py-4 rounded-2xl">
                <p className="text-2xl font-black text-primary">10+</p>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">Platforms</p>
             </div>
             <div className="bg-white/5 border border-white/10 px-6 py-4 rounded-2xl">
                <p className="text-2xl font-black text-primary">50k+</p>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">Daily Searches</p>
             </div>
             <div className="bg-white/5 border border-white/10 px-6 py-4 rounded-2xl">
                <p className="text-2xl font-black text-primary">₹2M+</p>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">User Savings</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
