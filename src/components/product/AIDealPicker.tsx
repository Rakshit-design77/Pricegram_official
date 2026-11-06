"use client";

import { useEffect, useState } from "react";
import { Sparkles, HelpCircle, CheckCircle2, AlertTriangle, Gift } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

interface AIDealPickerProps {
  title: string;
  price: number;
  platform: string;
}

interface AIDealData {
  verdict: string;
  isLowestPrice: boolean;
  alternatives: { platform: string; price: number; benefit: string }[];
  bundleSavings: string[];
}

export function AIDealPicker({ title, price, platform }: AIDealPickerProps) {
  const [data, setData] = useState<AIDealData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAIRecommendations() {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/ai?title=${encodeURIComponent(title)}&price=${price}&platform=${encodeURIComponent(platform)}`
        );
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error("AI Deal API error:", err);
      } finally {
        setLoading(false);
      }
    }

    if (title && price) {
      fetchAIRecommendations();
    }
  }, [title, price, platform]);

  if (loading) {
    return (
      <div className="space-y-3 p-5 rounded-3xl border border-primary/20 bg-primary/[0.02] mt-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5 rounded-full" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-4 p-5 rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/[0.03] to-secondary/[0.01] mt-4 relative overflow-hidden shadow-sm">
      {/* Decorative Blur */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-primary font-black text-xs uppercase tracking-wider">
          <Sparkles className="h-4 w-4 animate-pulse" />
          <span>Gemini AI Deal Insights</span>
        </div>
        <Badge variant="outline" className="text-[10px] border-primary/30 text-primary font-bold">
          Beta
        </Badge>
      </div>

      {/* Verdict */}
      <div className="flex items-start gap-3 bg-muted/40 p-3 rounded-2xl border">
        {data.isLowestPrice ? (
          <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
        ) : (
          <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
        )}
        <p className="text-sm font-semibold text-foreground/90 leading-snug">
          {data.verdict}
        </p>
      </div>

      {/* Alternatives */}
      {data.alternatives.length > 0 && (
        <div className="space-y-2">
          <h5 className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
            Smart Alternatives
          </h5>
          <div className="space-y-2">
            {data.alternatives.map((alt, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 rounded-xl bg-card border hover:border-primary/30 transition-colors"
              >
                <div>
                  <span className="text-xs font-black text-foreground">
                    {alt.platform}
                  </span>
                  <p className="text-[10px] text-muted-foreground">{alt.benefit}</p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-black text-emerald-500">
                    ₹{alt.price.toLocaleString()}
                  </span>
                  <p className="text-[8px] text-muted-foreground uppercase font-bold">
                    Est. Price
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bundle Savings */}
      {data.bundleSavings.length > 0 && (
        <div className="space-y-2">
          <h5 className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
            Bundle Savings & Hacks
          </h5>
          <ul className="space-y-1.5">
            {data.bundleSavings.map((hack, i) => (
              <li key={i} className="flex items-start gap-2 text-xs font-semibold text-muted-foreground">
                <Gift className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                <span>{hack}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
