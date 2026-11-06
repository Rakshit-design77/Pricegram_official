"use client";

import { useState } from "react";
import { Ticket, Copy, Check, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface Coupon {
  code: string;
  description: string;
  minOrder?: number;
  discount: string;
}

interface CouponListProps {
  platform: string;
}

// Sample static coupon database mapped to platforms
const couponsDb: Record<string, Coupon[]> = {
  amazon: [
    { code: "AMZ150", discount: "₹150 OFF", description: "Flat ₹150 discount on groceries", minOrder: 1500 },
    { code: "SBI10", discount: "10% OFF", description: "Instant discount on SBI Credit Cards", minOrder: 5000 },
    { code: "WELCOME50", discount: "₹50 OFF", description: "On your first shopping order on Amazon", minOrder: 200 }
  ],
  flipkart: [
    { code: "FKNEW100", discount: "₹100 OFF", description: "On your first fashion order", minOrder: 799 },
    { code: "HDFC10", discount: "10% OFF", description: "Instant bank discount on HDFC Debit/Credit Cards", minOrder: 3000 }
  ],
  zepto: [
    { code: "ZEPTO50", discount: "50% OFF", description: "Up to ₹100 on your first grocery delivery", minOrder: 199 },
    { code: "FREEZEPTO", discount: "FREE SHIP", description: "Free delivery on orders above ₹149", minOrder: 149 },
    { code: "ZEPTOBANK", discount: "₹75 OFF", description: "Using OneCard Credit Card payments", minOrder: 499 }
  ],
  blinkit: [
    { code: "BLINKNEW", discount: "₹100 OFF", description: "Flat ₹100 off for new users", minOrder: 299 },
    { code: "BOB15", discount: "15% OFF", description: "Using Bank of Baroda Credit Card", minOrder: 699 },
    { code: "BLINKCASH", discount: "₹50 CASH", description: "Flat cashback using Simpl pay later", minOrder: 399 }
  ],
  "swiggy instamart": [
    { code: "IMNEW", discount: "₹80 OFF", description: "On your first grocery order via Instamart", minOrder: 249 },
    { code: "IMICICI", discount: "₹100 OFF", description: "Using ICICI Bank Credit Cards", minOrder: 799 }
  ]
};

export function CouponList({ platform }: CouponListProps) {
  const { toast } = useToast();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const key = platform.toLowerCase();
  // Find matching coupons or fallback to default ones
  const matchingKey = Object.keys(couponsDb).find(k => key.includes(k)) || "amazon";
  const coupons = couponsDb[matchingKey] || [];

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast({
      title: "Coupon Copied!",
      description: `Code "${code}" copied to clipboard. Apply it at checkout!`,
    });
    setTimeout(() => setCopiedCode(null), 2000);
  };

  if (coupons.length === 0) return null;

  return (
    <div className="space-y-3 p-5 rounded-3xl border bg-card/40 mt-4">
      <div className="flex items-center gap-2 mb-1">
        <Ticket className="h-4 w-4 text-primary" />
        <h4 className="text-sm font-black uppercase tracking-wider">Coupons & Bank Offers</h4>
      </div>

      <div className="space-y-3">
        {coupons.map((coupon, i) => (
          <div
            key={i}
            className="flex items-center justify-between p-3.5 rounded-2xl bg-card border-2 border-dashed border-border/70 hover:border-primary/40 transition-colors relative overflow-hidden"
          >
            {/* Coupon Cutout Dots */}
            <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-background border-r rounded-full" />
            <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-background border-l rounded-full" />

            <div className="pl-3 pr-2 space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                  {coupon.code}
                </span>
                <span className="text-xs font-black text-emerald-500">{coupon.discount}</span>
              </div>
              <p className="text-[11px] font-semibold text-muted-foreground leading-tight">
                {coupon.description}
              </p>
              {coupon.minOrder && (
                <div className="flex items-center gap-1 text-[9px] font-bold text-muted-foreground/60 uppercase">
                  <Info className="h-2.5 w-2.5" />
                  Min. Order: ₹{coupon.minOrder}
                </div>
              )}
            </div>

            <Button
              size="sm"
              variant={copiedCode === coupon.code ? "secondary" : "ghost"}
              className="h-8 px-3 rounded-xl font-bold shrink-0 text-xs border"
              onClick={() => handleCopy(coupon.code)}
            >
              {copiedCode === coupon.code ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-500 mr-1" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 mr-1" />
                  Copy
                </>
              )}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
