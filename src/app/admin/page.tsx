"use client";

import { useState } from "react";
import {
  Sparkles,
  Layers,
  Settings,
  Plus,
  ToggleLeft,
  ToggleRight,
  TrendingUp,
  Mail,
  Smartphone,
  CheckCircle,
  Megaphone
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

interface SponsoredSlot {
  id: string;
  title: string;
  platform: string;
  price: number;
  active: boolean;
}

interface FeaturedDeal {
  id: string;
  title: string;
  platform: string;
  originalPrice: number;
  dealPrice: number;
  featured: boolean;
}

export default function AdminPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"sponsored" | "featured" | "stats">("sponsored");

  // Sponsored slots state
  const [sponsoredSlots, setSponsoredSlots] = useState<SponsoredSlot[]>([
    { id: "s-1", title: "Samsung Galaxy S24 Ultra", platform: "Amazon", price: 109999, active: true },
    { id: "s-2", title: "Zepto Quick Breakfast Pack", platform: "Zepto", price: 149, active: true },
    { id: "s-3", title: "Adidas Running Shoes", platform: "Flipkart", price: 2999, active: false }
  ]);

  // Featured deals state
  const [featuredDeals, setFeaturedDeals] = useState<FeaturedDeal[]>([
    { id: "f-1", title: "Amul Butter 500g", platform: "Blinkit", originalPrice: 275, dealPrice: 250, featured: true },
    { id: "f-2", title: "MacBook Air M3", platform: "Amazon", originalPrice: 114900, dealPrice: 99900, featured: true },
    { id: "f-3", title: "Ariel Matic 4kg", platform: "Zepto", originalPrice: 850, dealPrice: 699, featured: false }
  ]);

  // Form states
  const [newTitle, setNewTitle] = useState("");
  const [newPlatform, setNewPlatform] = useState("");
  const [newPrice, setNewPrice] = useState("");

  const toggleSponsored = (id: string) => {
    setSponsoredSlots(prev =>
      prev.map(item => (item.id === id ? { ...item, active: !item.active } : item))
    );
    toast({
      title: "Status Updated",
      description: "Sponsored listing status toggled successfully.",
    });
  };

  const toggleFeatured = (id: string) => {
    setFeaturedDeals(prev =>
      prev.map(item => (item.id === id ? { ...item, featured: !item.featured } : item))
    );
    toast({
      title: "Deal Status Changed",
      description: "Home page featured deals updated.",
    });
  };

  const handleCreateSponsored = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newPlatform || !newPrice) return;

    const newItem: SponsoredSlot = {
      id: `s-${Date.now()}`,
      title: newTitle,
      platform: newPlatform,
      price: parseFloat(newPrice),
      active: true
    };

    setSponsoredSlots(prev => [...prev, newItem]);
    setNewTitle("");
    setNewPlatform("");
    setNewPrice("");

    toast({
      title: "Sponsored Slot Created",
      description: `"${newTitle}" has been added as an active sponsored item.`,
    });
  };

  return (
    <div className="container mx-auto px-4 py-10 max-w-5xl space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-6">
        <div>
          <div className="flex items-center gap-2 text-primary font-black text-xs uppercase tracking-wider mb-1">
            <Settings className="h-4 w-4" /> Administrative Moderation Portal
          </div>
          <h1 className="text-3xl font-black uppercase tracking-tight">Admin & Moderation Panel</h1>
        </div>
        <Badge className="bg-emerald-500 font-bold px-3 py-1 rounded-full text-xs">
          Level: Admin Master
        </Badge>
      </div>

      {/* Toggles */}
      <div className="flex gap-2 border-b pb-4">
        <Button
          variant={activeTab === "sponsored" ? "default" : "ghost"}
          className="rounded-full text-xs font-black px-5"
          onClick={() => setActiveTab("sponsored")}
        >
          Sponsored Slots
        </Button>
        <Button
          variant={activeTab === "featured" ? "default" : "ghost"}
          className="rounded-full text-xs font-black px-5"
          onClick={() => setActiveTab("featured")}
        >
          Featured Deals
        </Button>
        <Button
          variant={activeTab === "stats" ? "default" : "ghost"}
          className="rounded-full text-xs font-black px-5"
          onClick={() => setActiveTab("stats")}
        >
          Alert Statistics
        </Button>
      </div>

      {/* Tab Contents */}
      <div className="space-y-6">
        {activeTab === "sponsored" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Create Sponsored form */}
            <div className="bg-card border rounded-[2rem] p-6 space-y-4 shadow-sm">
              <h3 className="text-sm font-black uppercase tracking-wider flex items-center gap-1.5">
                <Plus className="h-4 w-4 text-primary" /> Create Sponsored Slot
              </h3>
              <form onSubmit={handleCreateSponsored} className="space-y-4">
                <div className="space-y-1">
                  <span className="text-[9px] font-black uppercase text-muted-foreground">Product Title</span>
                  <Input
                    placeholder="e.g. Apple iPad Air"
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                    required
                    className="rounded-xl border bg-muted/40 h-10 text-xs font-semibold"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] font-black uppercase text-muted-foreground">Platform Provider</span>
                  <Input
                    placeholder="e.g. Amazon"
                    value={newPlatform}
                    onChange={e => setNewPlatform(e.target.value)}
                    required
                    className="rounded-xl border bg-muted/40 h-10 text-xs font-semibold"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] font-black uppercase text-muted-foreground">Discounted Price (₹)</span>
                  <Input
                    type="number"
                    placeholder="e.g. 54900"
                    value={newPrice}
                    onChange={e => setNewPrice(e.target.value)}
                    required
                    className="rounded-xl border bg-muted/40 h-10 text-xs font-semibold"
                  />
                </div>
                <Button type="submit" className="w-full rounded-xl font-black text-xs h-10 bg-primary">
                  Activate Sponsored Item
                </Button>
              </form>
            </div>

            {/* Sponsored Items list */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-sm font-black uppercase tracking-wider flex items-center gap-2 text-muted-foreground">
                <Megaphone className="h-4 w-4" /> Live Banner placements
              </h3>
              <div className="space-y-3">
                {sponsoredSlots.map(slot => (
                  <div
                    key={slot.id}
                    className="flex items-center justify-between p-4 bg-card border rounded-2xl hover:shadow-sm transition-shadow"
                  >
                    <div className="space-y-1">
                      <h4 className="font-bold text-sm">{slot.title}</h4>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[8px] uppercase py-0 font-bold">
                          {slot.platform}
                        </Badge>
                        <span className="text-xs font-semibold text-emerald-500">₹{slot.price.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className={`text-[10px] font-black uppercase tracking-wider ${slot.active ? "text-emerald-500" : "text-muted-foreground"}`}>
                        {slot.active ? "Active" : "Paused"}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground"
                        onClick={() => toggleSponsored(slot.id)}
                      >
                        {slot.active ? (
                          <ToggleRight className="h-6 w-6 text-primary" />
                        ) : (
                          <ToggleLeft className="h-6 w-6" />
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "featured" && (
          <div className="space-y-4">
            <h3 className="text-sm font-black uppercase tracking-wider text-muted-foreground">
              Manage Featured products & grid recommendations
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {featuredDeals.map(deal => (
                <div
                  key={deal.id}
                  className="flex items-center justify-between p-4 bg-card border rounded-2xl"
                >
                  <div className="space-y-1">
                    <h4 className="font-bold text-sm">{deal.title}</h4>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[8px] uppercase py-0 font-bold">{deal.platform}</Badge>
                      <span className="text-xs font-semibold text-rose-400 line-through">₹{deal.originalPrice}</span>
                      <span className="text-xs font-black text-emerald-500">₹{deal.dealPrice}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black uppercase text-muted-foreground">Featured Grid</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground"
                      onClick={() => toggleFeatured(deal.id)}
                    >
                      {deal.featured ? (
                        <ToggleRight className="h-6 w-6 text-primary" />
                      ) : (
                        <ToggleLeft className="h-6 w-6" />
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "stats" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            <div className="p-6 bg-card border rounded-[2rem] space-y-2 text-center">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary mx-auto">
                <Mail className="h-5 w-5" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground block">Email alerts sent</span>
              <h3 className="text-2xl font-black">28,450</h3>
              <p className="text-[10px] text-muted-foreground font-semibold">91.4% Delivery Success Rate</p>
            </div>

            <div className="p-6 bg-card border rounded-[2rem] space-y-2 text-center">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 mx-auto">
                <Smartphone className="h-5 w-5" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground block">WhatsApp alerts sent</span>
              <h3 className="text-2xl font-black">8,910</h3>
              <p className="text-[10px] text-emerald-500 font-bold">98.2% Deliverability Index</p>
            </div>

            <div className="p-6 bg-card border rounded-[2rem] space-y-2 text-center">
              <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary mx-auto">
                <CheckCircle className="h-5 w-5" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground block">Total Alert Triggers</span>
              <h3 className="text-2xl font-black">124</h3>
              <p className="text-[10px] text-muted-foreground font-semibold">Active price monitors</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
