"use client";

import { motion } from "framer-motion";

const platforms = [
  { name: "Amazon", logo: "https://www.vectorlogo.zone/logos/amazon/amazon-ar21.svg" },
  { name: "Flipkart", logo: "https://www.vectorlogo.zone/logos/flipkart/flipkart-ar21.svg" },
  { name: "Blinkit", logo: "https://logo.clearbit.com/blinkit.com" },
  { name: "Zepto", logo: "https://logo.clearbit.com/zepto.com" },
  { name: "Swiggy", logo: "https://www.vectorlogo.zone/logos/swiggy/swiggy-ar21.svg" },
  { name: "BigBasket", logo: "https://www.vectorlogo.zone/logos/bigbasket/bigbasket-ar21.svg" },
];

export function TrustSection() {
  return (
    <section className="py-20 bg-muted/30 border-y overflow-hidden">
      <div className="container mx-auto px-4 mb-12">
        <div className="flex flex-col items-center gap-2 text-center">
          <h3 className="text-xs font-black uppercase tracking-[0.4em] text-muted-foreground/60">Real-time Price Comparison Engine</h3>
          <p className="text-2xl md:text-3xl font-bold uppercase tracking-tight italic">Compare Prices Across Top Platforms</p>
        </div>
      </div>

      <div className="w-full relative overflow-hidden py-6 md:py-10">
        {/* Subtle Background Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-24 bg-primary/5 blur-[100px] pointer-events-none" />

        <div className="flex">
          <motion.div
            initial={{ x: 0 }}
            animate={{ x: "-50%" }}
            transition={{
              duration: 30,
              repeat: Infinity,
              ease: "linear",
            }}
            className="flex items-center gap-16 md:gap-24 whitespace-nowrap px-12"
          >
            {[...platforms, ...platforms].map((p, idx) => (
              <div
                key={`${p.name}-${idx}`}
                className="relative flex items-center justify-center min-w-[180px] md:min-w-[240px] h-16 md:h-24 group"
              >
                <img 
                  src={`/logos/${p.name.toLowerCase()}.webp`} 
                  alt={p.name}
                  className="h-full w-auto object-contain transition-all duration-500 scale-100 group-hover:scale-110 filter drop-shadow-sm"
                />
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
