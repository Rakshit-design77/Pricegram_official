"use client";

import { motion } from "framer-motion";
import { Search, Scale, Wallet, Bell } from "lucide-react";

const steps = [
  {
    title: "Search Anything",
    desc: "Type your product name - from daily groceries to the latest tech.",
    icon: Search,
    color: "bg-emerald-500",
    shadow: "shadow-emerald-500/20"
  },
  {
    title: "Live Comparison",
    desc: "We fetch real-time prices from 10+ platforms in under a second.",
    icon: Scale,
    color: "bg-orange-500",
    shadow: "shadow-orange-500/20"
  },
  {
    title: "Best Deal Picked",
    desc: "Our AI highlights the true lowest price including delivery fees.",
    icon: Wallet,
    color: "bg-blue-500",
    shadow: "shadow-blue-500/20"
  },
  {
    title: "Never Overpay",
    desc: "Set alerts and get notified on WhatsApp when prices drop.",
    icon: Bell,
    color: "bg-purple-500",
    shadow: "shadow-purple-500/20"
  }
];

export function HowItWorks() {
  return (
    <section className="py-24 bg-gradient-to-b from-background to-muted/20 overflow-hidden relative">
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/grid.png')]" />
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-24 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary font-bold text-[10px] uppercase tracking-widest">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            How It Works
          </div>
          <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none">Smart shopping <br /> <span className="text-primary">made simple</span></h2>
          <p className="text-muted-foreground text-lg font-medium">Save money in 4 easy steps. We handle the complexity, you get the deals.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 relative">
          {/* Connector Line (Desktop) */}
          <div className="hidden lg:block absolute top-1/2 left-0 w-full h-[2px] bg-muted/30 -translate-y-1/2 z-0" />
          
          {steps.map((step, idx) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              viewport={{ once: true }}
              className="relative z-10 flex flex-col items-center text-center space-y-6 group"
            >
              <div className={`w-24 h-24 rounded-[2.5rem] ${step.color} ${step.shadow} flex items-center justify-center text-white shadow-2xl transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110`}>
                <step.icon size={40} />
              </div>
              <div className="space-y-2">
                <div className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">Step 0{idx + 1}</div>
                <h3 className="text-xl font-bold uppercase tracking-tight">{step.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed max-w-[200px] mx-auto">{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
