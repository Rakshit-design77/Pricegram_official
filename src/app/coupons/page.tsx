"use client";

import { useState } from "react";
import { Ticket, Search, Copy, Check, Filter, ShieldCheck, Tag, ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface Coupon {
  id: string;
  code: string;
  discount: string;
  description: string;
  minOrder?: number;
  platform: string;
  category: "Grocery" | "Electronics" | "Fashion" | "General" | "Others";
  expiry: string;
  featured?: boolean;
}

const ALL_COUPONS: Coupon[] = [
  {
    id: "1",
    code: "ZEPTO50",
    discount: "50% OFF",
    description: "Up to ₹100 on your first grocery delivery",
    minOrder: 199,
    platform: "Zepto",
    category: "Grocery",
    expiry: "30 Jun 2026",
    featured: true
  },
  {
    id: "2",
    code: "BLINKNEW",
    discount: "₹100 OFF",
    description: "Flat ₹100 off on your first order. New users only.",
    minOrder: 299,
    platform: "Blinkit",
    category: "Grocery",
    expiry: "15 Jul 2026",
    featured: true
  },
  {
    id: "3",
    code: "AMZ150",
    discount: "₹150 OFF",
    description: "Flat ₹150 off on Amazon Fresh grocery orders above ₹1,500.",
    minOrder: 1500,
    platform: "Amazon",
    category: "Grocery",
    expiry: "31 Aug 2026"
  },
  {
    id: "4",
    code: "SBI10",
    discount: "10% OFF",
    description: "Instant discount on SBI Credit Cards. Max discount ₹1,500.",
    minOrder: 5000,
    platform: "Amazon",
    category: "Electronics",
    expiry: "30 Jun 2026",
    featured: true
  },
  {
    id: "5",
    code: "HDFC10",
    discount: "10% OFF",
    description: "Instant discount on HDFC Bank Cards. Max discount ₹2,000.",
    minOrder: 3000,
    platform: "Flipkart",
    category: "Electronics",
    expiry: "30 Jun 2026",
    featured: true
  },
  {
    id: "6",
    code: "FKNEW100",
    discount: "₹100 OFF",
    description: "Get ₹100 off on your first clothing purchase.",
    minOrder: 799,
    platform: "Flipkart",
    category: "Fashion",
    expiry: "31 Dec 2026"
  },
  {
    id: "7",
    code: "IMNEW",
    discount: "₹80 OFF",
    description: "On your first Swiggy Instamart order.",
    minOrder: 249,
    platform: "Swiggy Instamart",
    category: "Grocery",
    expiry: "15 Jul 2026"
  },
  {
    id: "8",
    code: "MYNTRA200",
    discount: "₹200 OFF",
    description: "Flat coupon discount on select lifestyle products.",
    minOrder: 1200,
    platform: "Myntra",
    category: "Fashion",
    expiry: "10 Jul 2026"
  }
];

export default function CouponsPage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const categories = ["All", "Grocery", "Electronics", "Fashion"];

  const handleCopy = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    toast({
      title: "Coupon Copied!",
      description: `Code "${code}" copied. Use it during checkout!`,
    });
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredCoupons = ALL_COUPONS.filter((coupon) => {
    const matchesSearch =
      coupon.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coupon.platform.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coupon.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || coupon.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="container mx-auto px-4 py-10 max-w-6xl space-y-10">
      {/* Header Banner */}
      <div className="relative rounded-[2.5rem] bg-gradient-to-r from-primary/90 to-secondary/80 p-8 md:p-12 overflow-hidden shadow-2xl text-white">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cartographer.png')] opacity-[0.05] pointer-events-none" />
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl space-y-4">
          <Badge className="bg-white/20 text-white border-none font-bold uppercase tracking-wider px-3 py-1">
            <Ticket className="h-3 w-3 mr-1 inline-block" /> Auto-Updated Daily
          </Badge>
          <h1 className="text-4xl md:text-5xl font-black leading-tight uppercase tracking-tighter">
            Coupons & Bank Offers
          </h1>
          <p className="text-white/80 font-medium">
            Save extra cash on Amazon, Flipkart, Zepto, Blinkit, and more. Copy coupon codes and get discount automatically!
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card p-4 rounded-3xl border shadow-sm">
        {/* Search */}
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search stores or offers..."
            className="pl-10 rounded-2xl bg-muted/40"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Category Toggles */}
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              className="rounded-full px-5 h-10 text-xs font-bold"
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* Coupons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCoupons.map((coupon) => (
          <div
            key={coupon.id}
            className={`flex flex-col justify-between p-6 bg-card border rounded-[2rem] hover:shadow-lg transition-all relative ${
              coupon.featured ? "border-primary/40 ring-1 ring-primary/20" : ""
            }`}
          >
            {/* Cutout details on cards */}
            <div className="absolute -left-3 top-[65%] w-6 h-6 bg-background border rounded-full" />
            <div className="absolute -right-3 top-[65%] w-6 h-6 bg-background border rounded-full" />

            <div>
              {/* Card Header */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-black uppercase tracking-wider text-primary">
                  {coupon.platform}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-muted border">
                  {coupon.category}
                </span>
              </div>

              {/* Discount Details */}
              <div className="space-y-2 mb-6">
                <div className="text-2xl font-black">{coupon.discount}</div>
                <p className="text-sm font-semibold text-muted-foreground leading-snug">
                  {coupon.description}
                </p>
              </div>
            </div>

            {/* Bottom Section */}
            <div className="border-t-2 border-dashed border-muted/80 pt-4 flex items-center justify-between mt-auto">
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-muted-foreground/50 uppercase block">Code</span>
                <span className="text-sm font-black tracking-wider uppercase bg-primary/5 px-2.5 py-1 rounded-lg border border-primary/15 text-primary">
                  {coupon.code}
                </span>
              </div>

              <div className="flex flex-col items-end gap-2">
                <span className="text-[8px] font-bold text-muted-foreground uppercase">
                  Expires: {coupon.expiry}
                </span>
                <Button
                  size="sm"
                  className="rounded-xl font-bold px-4 h-9 gap-1"
                  variant={copiedId === coupon.id ? "secondary" : "default"}
                  onClick={() => handleCopy(coupon.id, coupon.code)}
                >
                  {copiedId === coupon.id ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-500" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      Copy Code
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredCoupons.length === 0 && (
        <div className="text-center py-20 bg-muted/20 border border-dashed rounded-[2rem] space-y-4">
          <Ticket className="h-12 w-12 text-muted-foreground mx-auto" />
          <h3 className="text-xl font-bold">No coupons found</h3>
          <p className="text-sm text-muted-foreground">Try adjusting your filters or search keywords.</p>
        </div>
      )}

      {/* Extra Trust Signal Footer */}
      <div className="p-6 bg-primary/5 rounded-3xl border border-primary/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div className="space-y-1">
          <h4 className="text-sm font-black flex items-center gap-1 justify-center sm:justify-start">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            Verified & Tested Discounts
          </h4>
          <p className="text-xs text-muted-foreground font-semibold">
            All bank promotions and platform coupon codes are verified by our moderating team every morning.
          </p>
        </div>
        <Button asChild variant="outline" className="rounded-xl font-bold gap-1 text-xs">
          <a href="/search?q=all">
            Browse Live Deals <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </Button>
      </div>
    </div>
  );
}
