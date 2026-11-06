"use client";

import { useState, useEffect } from "react";
import { ProductCard } from "@/components/search/ProductCard";
import { Product } from "@/types";
import { Button } from "@/components/ui/button";
import { ChevronRight, TrendingUp, Sparkles, Loader2 } from "lucide-react";
import { ProductDetailModal } from "@/components/product/ProductDetailModal";
import { motion } from "framer-motion";

export function TrendingProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    async function fetchTrending() {
      try {
        // Fetch trending products (default query: "popular electronics groceries india")
        const response = await fetch('/api/search?q=trending%20groceries%20india');
        const data = await response.json();
        if (Array.isArray(data)) {
          setProducts(data.slice(0, 8)); // Show top 8
        }
      } catch (error) {
        console.error("Failed to fetch trending products:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchTrending();
  }, []);

  return (
    <section className="py-20 relative overflow-hidden bg-muted/30">
      {/* Decorative Background */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-[500px] h-[500px] bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 relative">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="space-y-4">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-bold border border-primary/20"
            >
              <TrendingUp className="w-4 h-4" />
              Hot Right Now
            </motion.div>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-black tracking-tight"
            >
              Trending <span className="text-primary italic">Deals</span>
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-muted-foreground text-lg max-w-xl"
            >
              Most popular products across all major Indian platforms. Real prices, real savings.
            </motion.p>
          </div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <Button variant="outline" className="rounded-full group hover:bg-primary hover:text-white transition-all duration-300 border-2 px-6 h-12">
              View All Offers
              <ChevronRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <p className="text-muted-foreground font-medium animate-pulse">Scanning 100+ stores for the best deals...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                onClick={() => setSelectedProduct(product)}
                className="cursor-pointer"
              >
                <div className="relative group">
                  {index < 3 && (
                    <div className="absolute -top-3 -right-3 z-10 bg-orange-500 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg transform rotate-12 group-hover:rotate-0 transition-transform flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      FAST SELLING
                    </div>
                  )}
                  <ProductCard product={product} viewMode="grid" />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <ProductDetailModal 
        product={selectedProduct} 
        isOpen={!!selectedProduct} 
        onClose={() => setSelectedProduct(null)} 
      />
    </section>
  );
}
