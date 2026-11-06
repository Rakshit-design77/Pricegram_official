"use client";

import { motion } from "framer-motion";
import { Quote, Star } from "lucide-react";

const reviews = [
  {
    name: "Ananya Sharma",
    role: "Smart Shopper",
    comment: "PriceGram saved me ₹400 on my weekly grocery bill just by showing me that Blinkit was cheaper than BigBasket that day!",
    avatar: "AS",
    color: "bg-emerald-500"
  },
  {
    name: "Rahul Gupta",
    role: "Tech Enthusiast",
    comment: "I used it for iPhone 16. The real-time tracking is crazy fast. Found a credit card deal on Amazon that I almost missed.",
    avatar: "RG",
    color: "bg-blue-500"
  },
  {
    name: "Priya Patel",
    role: "Working Professional",
    comment: "The WhatsApp price alerts are a lifesaver. I set an alert for a Dyson vacuum and bought it exactly when it hit my target price.",
    avatar: "PP",
    color: "bg-orange-500"
  }
];

export function Testimonials() {
  return (
    <section className="py-24 bg-gradient-to-t from-background to-muted/20 overflow-hidden relative">
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-24 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 border border-secondary/20 text-secondary font-bold text-[10px] uppercase tracking-widest">
            Community Love
          </div>
          <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none">Trusted by <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">50k+ Indians</span></h2>
          <p className="text-muted-foreground text-lg font-medium">Don't just take our word for it. Here's what smart shoppers say.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((review, idx) => (
            <motion.div
              key={review.name}
              initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              viewport={{ once: true }}
              className="p-8 bg-muted/20 border border-border/50 rounded-[3rem] relative"
            >
              <Quote className="absolute top-8 right-8 text-muted-foreground/20 h-12 w-12" />
              <div className="flex items-center gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-secondary text-secondary" />
                ))}
              </div>
              <p className="text-foreground font-medium text-lg leading-relaxed mb-8 italic">
                "{review.comment}"
              </p>
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl ${review.color} flex items-center justify-center text-white font-black shadow-lg shadow-black/5`}>
                  {review.avatar}
                </div>
                <div>
                  <div className="font-bold uppercase tracking-tight">{review.name}</div>
                  <div className="text-xs text-muted-foreground font-bold tracking-widest">{review.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
