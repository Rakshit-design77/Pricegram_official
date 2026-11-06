"use client";

import { useUser, SignInButton } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import {
  TrendingDown,
  Bell,
  Trash2,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  PiggyBank,
  Search,
  Lock,
  Mail,
  Smartphone
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStore } from "@/store/useStore";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import Image from "next/image";

interface TrackedProduct {
  id: string;
  title: string;
  image: string;
  platform: string;
  currentPrice: number;
  alertPrice: number;
  lastUpdated: string;
  savings: number;
}

export default function UserDashboard() {
  const { isLoaded, isSignedIn, user } = useUser();
  const { recentSearches } = useStore();
  const { toast } = useToast();

  const [trackedProducts, setTrackedProducts] = useState<TrackedProduct[]>([
    {
      id: "track-1",
      title: "Amul Gold Milk 500ml",
      image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=200&auto=format&fit=crop",
      platform: "Zepto",
      currentPrice: 33,
      alertPrice: 31,
      lastUpdated: "5 mins ago",
      savings: 4
    },
    {
      id: "track-2",
      title: "iPhone 16 Pro Max 256GB Black",
      image: "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=200&auto=format&fit=crop",
      platform: "Amazon",
      currentPrice: 139900,
      alertPrice: 142000,
      lastUpdated: "1 hour ago",
      savings: 5000
    },
    {
      id: "track-3",
      title: "Aashirvaad Shudh Chakki Atta 10kg",
      image: "https://images.unsplash.com/photo-1574316071802-0d684efa7bf5?w=200&auto=format&fit=crop",
      platform: "Blinkit",
      currentPrice: 460,
      alertPrice: 450,
      lastUpdated: "20 mins ago",
      savings: 30
    }
  ]);

  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    // Check local premium tier simulation
    const premiumStatus = localStorage.getItem("pricegram_premium") === "true";
    setIsPremium(premiumStatus);
  }, []);

  const handleDelete = (id: string, name: string) => {
    setTrackedProducts(prev => prev.filter(p => p.id !== id));
    toast({
      title: "Product Untracked",
      description: `Stopped tracking price changes for ${name}`,
    });
  };

  const totalSaved = trackedProducts.reduce((sum, p) => sum + p.savings, 0);

  // Loading State
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
      </div>
    );
  }

  // Not Logged In State
  if (!isSignedIn) {
    return (
      <div className="container mx-auto px-4 py-20 max-w-md text-center space-y-6">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary">
          <Lock className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-black uppercase tracking-tighter">Login Required</h2>
        <p className="text-muted-foreground text-sm font-semibold">
          Unlock your personalized savings dashboard, wishlist tracker, and priority WhatsApp alerts.
        </p>
        <SignInButton mode="modal">
          <Button size="lg" className="w-full rounded-2xl font-black bg-primary shadow-xl shadow-primary/20">
            Login / Sign Up
          </Button>
        </SignInButton>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl space-y-8">
      {/* Profile & Premium Status */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-card p-6 rounded-[2rem] border shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-primary/20">
            {user.imageUrl ? (
              <img src={user.imageUrl} alt={user.fullName || "User"} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-primary flex items-center justify-center text-white font-black text-2xl">
                {user.firstName ? user.firstName[0] : "U"}
              </div>
            )}
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight leading-none">
              Namaste, {user.firstName || user.fullName || "User"}!
            </h1>
            <p className="text-sm text-muted-foreground mt-1.5 font-semibold">
              Manage your price drops, alerts, and savings.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isPremium ? (
            <Badge className="bg-gradient-to-r from-yellow-400 to-amber-500 text-yellow-950 font-black border-none px-4 py-2 rounded-full text-xs shadow-md">
              👑 PREMIUM MEMBER
            </Badge>
          ) : (
            <div className="flex items-center gap-3 bg-muted/30 p-3 rounded-2xl border">
              <span className="text-xs font-bold text-muted-foreground">Free Tier Account</span>
              <Button asChild size="sm" className="rounded-xl font-black bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-90">
                <Link href="/premium">Upgrade to Premium</Link>
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Analytics/Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 bg-card border rounded-[2rem] flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
            <PiggyBank className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Total Savings</span>
            <h3 className="text-xl font-black text-emerald-500">₹{totalSaved.toLocaleString()}</h3>
          </div>
        </div>
        <div className="p-6 bg-card border rounded-[2rem] flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
            <TrendingDown className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Tracked Products</span>
            <h3 className="text-xl font-black">{trackedProducts.length} items</h3>
          </div>
        </div>
        <div className="p-6 bg-card border rounded-[2rem] flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary">
            <Bell className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Alert Channel</span>
            <h3 className="text-xl font-black flex items-center gap-1">
              <Mail className="h-4 w-4 text-emerald-500" />
              {isPremium ? (
                <>
                  <span className="text-muted-foreground font-medium text-sm">+</span>
                  <Smartphone className="h-4 w-4 text-emerald-500" />
                  WhatsApp
                </>
              ) : (
                "Email Only"
              )}
            </h3>
          </div>
        </div>
      </div>

      {/* Main Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Tracked Products */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-black uppercase tracking-wider flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-primary" /> Tracked Products Price Monitor
          </h2>

          {trackedProducts.length > 0 ? (
            <div className="space-y-4">
              {trackedProducts.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-4 bg-card border rounded-[2rem] hover:shadow-md transition-shadow gap-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-white shrink-0 border">
                      <img src={p.image} alt={p.title} className="w-full h-full object-contain p-1" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm line-clamp-1 max-w-[200px] sm:max-w-xs">{p.title}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-[9px] uppercase font-bold py-0">
                          {p.platform}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground font-semibold">Updated {p.lastUpdated}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-sm font-black">₹{p.currentPrice.toLocaleString()}</div>
                      <span className="text-[10px] text-muted-foreground font-bold">
                        Target: ₹{p.alertPrice.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 rounded-full text-muted-foreground hover:text-rose-500"
                        onClick={() => handleDelete(p.id, p.title)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-muted/20 border border-dashed rounded-[2rem] space-y-4">
              <TrendingDown className="h-10 w-10 text-muted-foreground mx-auto" />
              <h3 className="text-lg font-bold">No products tracked yet</h3>
              <p className="text-sm text-muted-foreground">Search for products and click "Set Price Alert" to track them.</p>
              <Button asChild rounded-full>
                <Link href="/">Browse Homepage</Link>
              </Button>
            </div>
          )}
        </div>

        {/* Sidebar: Recent Searches & Alerts settings */}
        <div className="space-y-6">
          {/* Recent Searches */}
          <div className="bg-card border rounded-[2rem] p-6 space-y-4 shadow-sm">
            <h3 className="font-black uppercase tracking-wider text-xs text-muted-foreground flex items-center gap-2">
              <Search className="h-4 w-4" /> Recent Searches
            </h3>
            {recentSearches.length > 0 ? (
              <div className="space-y-2">
                {recentSearches.map((term, i) => (
                  <Link
                    key={i}
                    href={`/search?q=${encodeURIComponent(term)}`}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-muted/40 hover:bg-muted transition-colors font-bold text-xs"
                  >
                    <span>{term}</span>
                    <ChevronRight className="h-3 w-3 text-muted-foreground" />
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground font-semibold">Your recent search terms will appear here.</p>
            )}
          </div>

          {/* Alert Channel Configuration */}
          <div className="bg-card border rounded-[2rem] p-6 space-y-4 shadow-sm">
            <h3 className="font-black uppercase tracking-wider text-xs text-muted-foreground flex items-center gap-2">
              <Bell className="h-4 w-4" /> Notifications Setup
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-muted-foreground">Email Alerts</span>
                <span className="text-emerald-500 font-bold">Active</span>
              </div>
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-muted-foreground">WhatsApp Alerts</span>
                {isPremium ? (
                  <span className="text-emerald-500 font-bold">Active</span>
                ) : (
                  <span className="text-muted-foreground/60 font-bold">Premium Only</span>
                )}
              </div>
              {!isPremium && (
                <div className="pt-2 border-t text-[11px] font-semibold text-muted-foreground">
                  Want WhatsApp alerts on price drops? Upgrading to Premium takes less than 30 seconds!
                  <Button asChild variant="link" className="p-0 h-auto font-black text-primary text-[11px] block mt-1">
                    <Link href="/premium">Learn More & Upgrade →</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
