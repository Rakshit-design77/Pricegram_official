"use client";

import { ShoppingBasket, Laptop, Shirt, Home, Sparkles, Smartphone } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

const categories = [
  { name: "Grocery & Essentials", icon: ShoppingBasket, color: "bg-green-500/10 text-green-500" },
  { name: "Electronics", icon: Laptop, color: "bg-blue-500/10 text-blue-500" },
  { name: "Fashion", icon: Shirt, color: "bg-purple-500/10 text-purple-500" },
  { name: "Home & Kitchen", icon: Home, color: "bg-orange-500/10 text-orange-500" },
  { name: "Beauty", icon: Sparkles, color: "bg-pink-500/10 text-pink-500" },
  { name: "Mobiles", icon: Smartphone, color: "bg-cyan-500/10 text-cyan-500" },
];

export function CategoryList() {
  return (
    <section className="py-12 bg-background">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold mb-8">Popular Categories</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((category, index) => (
            <motion.div
              key={category.name}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              whileHover={{ y: -5 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Link
                href={`/search?category=${encodeURIComponent(category.name)}`}
                className="flex flex-col items-center justify-center p-6 bg-card border rounded-2xl transition-all hover:shadow-xl group"
              >
                <div className={`p-4 rounded-2xl mb-4 transition-colors ${category.color} group-hover:scale-110 transition-transform`}>
                  <category.icon className="h-8 w-8" />
                </div>
                <span className="text-sm font-semibold text-center">{category.name}</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
