"use client";

import { useCartStore } from "@/store/cartStore";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Trash2, Sparkles, AlertTriangle, CheckCircle2, TrendingDown } from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface AIAnalysis {
  recommendation: string;
  totalSavings: number;
  warnings: string[];
  suggestedAction: string;
}

export function SmartCartDrawer() {
  const { items, isCartOpen, setIsCartOpen, removeItem } = useCartStore();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleOptimize = async () => {
    if (items.length < 2) {
      toast.error("Add at least 2 items to optimize bundle savings!");
      return;
    }
    
    setIsAnalyzing(true);
    setAnalysis(null);
    
    try {
      const res = await fetch("/api/ai/cart-optimizer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to analyze cart");
      
      setAnalysis(data);
    } catch (err: any) {
      toast.error(err.message || "Something went wrong.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const totalOriginalPrice = items.reduce((sum, item) => sum + item.mrp, 0);
  const totalCurrentPrice = items.reduce((sum, item) => sum + item.price, 0);

  if (!mounted) return null;

  return (
    <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
      <SheetContent className="w-full sm:max-w-md flex flex-col p-0 border-l border-white/10 bg-background/95 backdrop-blur-xl">
        <div className="p-6 border-b">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2 text-2xl font-black">
              <ShoppingCart className="w-6 h-6 text-primary" />
              Smart Cart
            </SheetTitle>
            <SheetDescription>
              {items.length} {items.length === 1 ? "item" : "items"} in your cart.
            </SheetDescription>
          </SheetHeader>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <AnimatePresence>
            {items.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                className="flex flex-col items-center justify-center h-full text-muted-foreground gap-4"
              >
                <ShoppingCart className="w-16 h-16 opacity-20" />
                <p>Your cart is empty.</p>
              </motion.div>
            ) : (
              items.map((item) => (
                <motion.div
                  key={item.cartItemId}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex gap-4 items-center bg-muted/30 p-3 rounded-2xl border"
                >
                  <div className="w-16 h-16 relative rounded-xl overflow-hidden bg-white shrink-0">
                    <Image src={item.image} alt={item.title} fill className="object-contain p-1" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold truncate">{item.title}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm font-black text-primary">₹{item.price.toLocaleString()}</span>
                      <span className="text-xs text-muted-foreground line-through">₹{item.mrp.toLocaleString()}</span>
                    </div>
                    <div className="text-[10px] uppercase font-bold text-muted-foreground mt-1 tracking-wider">
                      {item.platform}
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 shrink-0"
                    onClick={() => removeItem(item.cartItemId)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </motion.div>
              ))
            )}
          </AnimatePresence>

          {/* AI Analysis Result */}
          {analysis && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 space-y-4 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-transparent p-5 rounded-3xl border border-indigo-500/20"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-500" />
                <h3 className="font-black text-lg">AI Bundle Insights</h3>
              </div>
              
              <p className="text-sm leading-relaxed text-muted-foreground">
                {analysis.recommendation}
              </p>
              
              {analysis.totalSavings > 0 && (
                <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-500 p-3 rounded-xl">
                  <TrendingDown className="w-5 h-5" />
                  <span className="font-bold">Potential Extra Savings: ₹{analysis.totalSavings.toLocaleString()}</span>
                </div>
              )}
              
              {analysis.warnings.length > 0 && (
                <div className="space-y-2">
                  {analysis.warnings.map((warning, idx) => (
                    <div key={idx} className="flex items-start gap-2 bg-amber-500/10 text-amber-500 p-3 rounded-xl text-xs font-medium">
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                      {warning}
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </div>

        <div className="p-6 border-t bg-background/50 backdrop-blur-md">
          <div className="flex justify-between items-end mb-4">
            <div>
              <p className="text-sm text-muted-foreground">Total</p>
              <h2 className="text-2xl font-black">₹{totalCurrentPrice.toLocaleString()}</h2>
            </div>
            <div className="text-right">
              <p className="text-xs text-emerald-500 font-bold bg-emerald-500/10 px-2 py-1 rounded-full inline-block mb-1">
                Saved ₹{(totalOriginalPrice - totalCurrentPrice).toLocaleString()}
              </p>
            </div>
          </div>
          
          <Button 
            className="w-full h-12 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:opacity-90 transition-opacity font-bold text-white shadow-lg shadow-indigo-500/25 relative overflow-hidden group"
            onClick={handleOptimize}
            disabled={isAnalyzing || items.length === 0}
          >
            {isAnalyzing ? (
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 animate-spin" />
                Analyzing Cart...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Optimize with AI
              </span>
            )}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
