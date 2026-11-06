"use client";

import { motion } from "framer-motion";
import { Brain, BellRing, Layers, Zap, ShieldCheck, Globe } from "lucide-react";

const features = [
  {
    title: "Best Deal Algorithm",
    desc: "Our engine doesn't just look at MRP. We calculate hidden costs like delivery fees and packaging to find the absolute lowest price.",
    icon: Brain,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10"
  },
  {
    title: "Instant Price Alerts",
    desc: "Found something but wait for a drop? Set a target price and get instant WhatsApp/Email alerts when it hits your budget.",
    icon: BellRing,
    color: "text-orange-500",
    bg: "bg-orange-500/10"
  },
  {
    title: "Multi-Platform Compare",
    desc: "From 10-minute grocery apps (Zepto, Blinkit) to mega e-commerce sites (Amazon, Flipkart) - all in one search tab.",
    icon: Layers,
    color: "text-blue-500",
    bg: "bg-blue-500/10"
  },
  {
    title: "Lightning Fast API",
    desc: "We bridge multiple scrapers and APIs to bring you results in under 800ms. No more manual app switching.",
    icon: Zap,
    color: "text-yellow-500",
    bg: "bg-yellow-500/10"
  },
  {
    title: "Authentic Reviews",
    desc: "We aggregate ratings across all platforms to give you a unified trust score for every product.",
    icon: ShieldCheck,
    color: "text-purple-500",
    bg: "bg-purple-500/10"
  },
  {
    title: "Pincode Optimized",
    desc: "Results are localized to your area. We only show platforms that deliver to your specific pincode.",
    icon: Globe,
    color: "text-cyan-500",
    bg: "bg-cyan-500/10"
  }
];

export function SmartFeatures() {
  return (
    <section className="py-24 bg-muted/30 relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between mb-20 gap-8">
          <div className="max-w-2xl space-y-4">
            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter">Why PriceGram?</h2>
            <p className="text-muted-foreground text-lg">We built the tech so you don't have to waste time opening 10 different apps every time you shop.</p>
          </div>
          <div className="flex -space-x-4">
             {[1,2,3,4].map(i => (
               <div key={i} className="w-16 h-16 rounded-full border-4 border-background bg-muted flex items-center justify-center font-bold text-xs">
                 {/* Placeholder for platform icons */}
                 P{i}
               </div>
             ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              viewport={{ once: true }}
              className="p-8 bg-card border border-border/50 rounded-[2.5rem] hover:shadow-2xl hover:shadow-primary/5 transition-all group"
            >
              <div className={`w-14 h-14 rounded-2xl ${feature.bg} ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                <feature.icon size={28} />
              </div>
              <h3 className="text-xl font-bold mb-4 uppercase tracking-tight">{feature.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Decorative background circle */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] -z-0" />
    </section>
  );
}
