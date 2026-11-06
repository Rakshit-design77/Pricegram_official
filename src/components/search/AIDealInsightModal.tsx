"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sparkles, TrendingDown, Info, ExternalLink, RefreshCw, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

interface AIDealInsightModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  product: {
    title: string;
    price: number;
    platform: string;
  };
}

interface AIResponse {
  verdict: string;
  isLowestPrice: boolean;
  alternatives: { platform: string; price: number; benefit: string }[];
  bundleSavings: string[];
}

export function AIDealInsightModal({ isOpen, onOpenChange, product }: AIDealInsightModalProps) {
  const [data, setData] = useState<AIResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isFreemiumLimit, setIsFreemiumLimit] = useState(false);

  useEffect(() => {
    if (isOpen && !data && !isLoading && !error) {
      fetchInsights();
    }
  }, [isOpen, data, isLoading, error]);

  const fetchInsights = async () => {
    setIsLoading(true);
    setError("");
    setIsFreemiumLimit(false);
    try {
      const params = new URLSearchParams({
        title: product.title,
        price: product.price.toString(),
        platform: product.platform
      });
      const res = await fetch(`/api/ai?${params.toString()}`);
      let json;
      try {
        json = await res.json();
      } catch (e) {
        throw new Error("Failed to parse API response");
      }
      
      if (!res.ok) {
        if (json.isFreemiumLimit) {
          setIsFreemiumLimit(true);
        }
        throw new Error(json.error || "Failed to generate AI insights");
      }
      
      setData(json);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    setData(null);
    fetchInsights();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 overflow-hidden rounded-[2.5rem] border-0 shadow-2xl bg-gradient-to-b from-background to-background/95 backdrop-blur-3xl sm:max-w-[425px]">
        
        {/* Header Area with Animated Gradient */}
        <div className="relative pt-8 pb-4 px-6 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 pointer-events-none" />
          <div className="absolute top-0 right-0 p-32 bg-indigo-500/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
          
          <DialogHeader className="relative z-10">
            <DialogTitle className="flex items-center gap-2 text-2xl font-black tracking-tight">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600">
                AI Deal Analyst
              </span>
            </DialogTitle>
            <div className="text-xs font-semibold text-muted-foreground mt-2 line-clamp-1 opacity-80">
              Analyzing: {product.title}
            </div>
          </DialogHeader>
        </div>

        <div className="px-6 pb-8 min-h-[300px]">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6 pt-4"
              >
                <div className="space-y-3">
                  <div className="h-4 bg-muted/60 rounded-full w-3/4 animate-pulse" />
                  <div className="h-4 bg-muted/60 rounded-full w-full animate-pulse" />
                  <div className="h-4 bg-muted/60 rounded-full w-5/6 animate-pulse" />
                </div>
                
                <div className="grid grid-cols-2 gap-3 pt-4">
                  <div className="h-24 bg-muted/40 rounded-2xl animate-pulse" />
                  <div className="h-24 bg-muted/40 rounded-2xl animate-pulse" />
                </div>
                
                <div className="h-12 bg-muted/40 rounded-xl w-full animate-pulse mt-4" />
                
                <div className="flex items-center justify-center gap-2 text-xs font-bold text-muted-foreground animate-pulse pt-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  Gathering intelligence across platforms...
                </div>
              </motion.div>
            ) : error ? (
              <motion.div
                key="error"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center text-center space-y-4 pt-12"
              >
                <div className="w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500">
                  <Info className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-foreground">
                    {isFreemiumLimit ? "Daily Limit Reached" : "Analysis Failed"}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">{error}</p>
                </div>
                
                {isFreemiumLimit ? (
                  <Button asChild className="rounded-full mt-4 w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700">
                    <a href="/premium">
                      <Sparkles className="w-4 h-4 mr-2" />
                      Upgrade to Premium
                    </a>
                  </Button>
                ) : (
                  <Button onClick={handleRetry} variant="outline" className="rounded-full mt-2" size="sm">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Try Again
                  </Button>
                )}
              </motion.div>
            ) : data ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-6 pt-2"
              >
                {/* Verdict Section */}
                <div className="p-5 rounded-[1.5rem] bg-gradient-to-br from-indigo-500/5 to-purple-500/5 border border-indigo-500/10 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="flex items-start gap-3 relative z-10">
                    <div className="mt-1">
                      {data.isLowestPrice ? (
                        <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                          <TrendingDown className="w-4 h-4 text-emerald-500" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                          <Info className="w-4 h-4 text-amber-500" />
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">AI Verdict</h4>
                      <p className="text-sm font-semibold leading-relaxed text-foreground/90">
                        {data.verdict}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Alternatives */}
                {data.alternatives && data.alternatives.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Smart Alternatives</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {data.alternatives.map((alt, i) => (
                        <div key={i} className="p-4 rounded-[1.25rem] bg-muted/40 hover:bg-muted/60 transition-colors border">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-bold text-sm">{alt.platform}</span>
                            <span className="font-black text-sm text-emerald-500">₹{alt.price.toLocaleString()}</span>
                          </div>
                          <p className="text-xs font-semibold text-muted-foreground">{alt.benefit}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Bundle Savings */}
                {data.bundleSavings && data.bundleSavings.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Pro Tips</h4>
                    <div className="space-y-2">
                      {data.bundleSavings.map((tip, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm font-medium bg-muted/30 p-3 rounded-xl border border-dashed">
                          <CheckCircle2 className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0" />
                          <span className="text-muted-foreground text-xs leading-relaxed">{tip}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}
