"use client";

import { Product } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PriceHistoryChart } from "./PriceHistoryChart";
import { AIDealPicker } from "./AIDealPicker";
import { CouponList } from "./CouponList";
import { getAffiliateLink } from "@/lib/affiliate";
import { useToast } from "@/hooks/use-toast";
import { Star, Truck, ShieldCheck, Share2, Heart, Bell, ExternalLink } from "lucide-react";
import Image from "next/image";

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ProductDetailModal({ product, isOpen, onClose }: ProductDetailModalProps) {
  const { toast } = useToast();
  if (!product) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden rounded-3xl border-none">
        <div className="flex flex-col md:flex-row h-full max-h-[90vh] overflow-y-auto no-scrollbar">
          
          {/* Left Side: Images */}
          <div className="w-full md:w-1/2 bg-white flex items-center justify-center p-8 sticky top-0">
             <div className="relative aspect-square w-full">
                <Image
                  src={product.image}
                  alt={product.title}
                  fill
                  className="object-contain"
                />
             </div>
             <div className="absolute top-4 left-4 flex flex-col gap-2">
                <Badge className="bg-emerald-500 border-none font-bold px-3 py-1">
                  {product.discount}% OFF
                </Badge>
                {product.isBestDeal && (
                  <Badge className="bg-yellow-400 text-yellow-950 border-none font-bold px-3 py-1">
                    BEST DEAL
                  </Badge>
                )}
             </div>
          </div>

          {/* Right Side: Info */}
          <div className="w-full md:w-1/2 p-6 md:p-8 space-y-6 bg-card">
            <DialogHeader>
              <div className="flex items-center justify-between mb-2">
                 <span className="text-xs font-bold text-primary uppercase tracking-widest">{product.platform}</span>
                 <div className="flex gap-2">
                   <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                      <Share2 className="h-4 w-4" />
                   </Button>
                   <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                      <Heart className="h-4 w-4" />
                   </Button>
                 </div>
              </div>
              <DialogTitle className="text-2xl font-black leading-tight">
                {product.title}
              </DialogTitle>
            </DialogHeader>

            <div className="flex items-center gap-4">
               {product.rating && (
                 <div className="flex items-center gap-1.5 bg-muted px-3 py-1 rounded-full">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-black">{product.rating}</span>
                    <span className="text-xs text-muted-foreground ml-1">(2.5k reviews)</span>
                 </div>
               )}
            </div>

            <div className="space-y-1">
               <div className="flex items-center gap-3">
                 <span className="text-4xl font-black">₹{product.price.toLocaleString()}</span>
                 <span className="text-lg text-muted-foreground line-through">₹{product.mrp.toLocaleString()}</span>
               </div>
               <p className="text-sm text-emerald-500 font-bold">You save ₹{(product.mrp - product.price).toLocaleString()} with this deal!</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="p-4 bg-muted/50 rounded-2xl border flex flex-col gap-1">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Truck className="h-4 w-4" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Delivery</span>
                  </div>
                  <span className="text-sm font-bold">{product.deliveryTime}</span>
               </div>
               <div className="p-4 bg-muted/50 rounded-2xl border flex flex-col gap-1">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <ShieldCheck className="h-4 w-4" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Status</span>
                  </div>
                  <span className={cn(
                    "text-sm font-bold",
                    product.stockStatus === "In stock" ? "text-emerald-500" : "text-orange-500"
                  )}>
                    {product.stockStatus}
                  </span>
               </div>
            </div>

            <div className="space-y-4">
               <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                 <ShieldCheck className="h-4 w-4" />
                 Price Analysis
               </h4>
               <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">Deal Rating</span>
                    <div className="flex items-center gap-1 mt-1">
                       {[...Array(5)].map((_, i) => (
                         <Star key={i} className={cn("h-4 w-4", i < (product.dealRating || 3) ? "fill-primary text-primary" : "text-muted")} />
                       ))}
                    </div>
                  </div>
                  <div className="p-4 bg-muted/30 rounded-2xl border">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">Average Price</span>
                    <p className="text-lg font-black mt-1">₹{product.avgPrice?.toLocaleString() || "..."}</p>
                  </div>
               </div>
            </div>

            {product.competitors && product.competitors.length > 0 && (
               <div className="space-y-4 pt-2">
                  <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Compare Platforms</h4>
                  <div className="space-y-2">
                     {product.competitors.map((comp, i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-card border rounded-xl hover:bg-muted/50 transition-colors">
                           <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center font-bold text-xs">
                                 {comp.platform[0]}
                              </div>
                              <span className="font-bold text-sm">{comp.platform}</span>
                           </div>
                           <div className="flex items-center gap-4">
                              <span className="font-black text-sm">₹{comp.price.toLocaleString()}</span>
                              <Button asChild variant="ghost" size="sm" className="h-8 px-3 text-xs font-bold gap-1">
                                 <a href={getAffiliateLink(comp.url, comp.platform)} target="_blank" rel="noopener noreferrer">
                                    View <ExternalLink className="h-3 w-3" />
                                 </a>
                              </Button>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
            )}

            {/* Auto Coupon List */}
            <CouponList platform={product.platform} />

            {/* AI Deal Picker */}
            <AIDealPicker title={product.title} price={product.price} platform={product.platform} />

            {/* Detailed Price History Chart */}
            <PriceHistoryChart productId={product.id} currentPrice={product.price} />

            <div className="flex flex-col gap-3 pt-4 sticky bottom-0 bg-card">
               <Button 
                 asChild
                 className="w-full h-14 rounded-2xl text-lg font-black shadow-xl shadow-primary/20"
               >
                 <a href={getAffiliateLink(product.url, product.platform)} target="_blank" rel="noopener noreferrer">
                   Buy Now at {product.platform}
                 </a>
               </Button>
               <Button 
                 variant="outline" 
                 className="w-full h-14 rounded-2xl font-bold gap-2"
                 onClick={() => {
                   const isPremiumUser = localStorage.getItem("pricegram_premium") === "true";
                   toast({
                     title: "Price Alert Active!",
                     description: `We will track "${product.title}" and send you an update via ${isPremiumUser ? "WhatsApp & Email" : "Email"} if it drops below ₹${Math.round(product.price * 0.95).toLocaleString()}.`,
                   });
                 }}
               >
                 <Bell className="h-5 w-5 text-primary" />
                 Set Price Alert
               </Button>
            </div>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}
