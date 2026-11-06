"use client";

import { Product } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Star, Truck, ShoppingCart, ExternalLink, Sparkles } from "lucide-react";
import { useState } from "react";
import { AIDealInsightModal } from "./AIDealInsightModal";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/cartStore";
import { toast } from "sonner";

interface ProductCardProps {
  product: Product;
  viewMode: "grid" | "list";
}

export function ProductCard({ product, viewMode }: ProductCardProps) {
  const isGrid = viewMode === "grid";
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const addItem = useCartStore(state => state.addItem);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
    toast.success("Added to Smart Cart", {
      description: `${product.title.substring(0, 30)}...`,
    });
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "group h-full",
        isGrid ? "" : "w-full"
      )}
    >
      <Card className={cn(
        "overflow-hidden border-none shadow-md hover:shadow-xl transition-all duration-300 bg-card",
        isGrid ? "h-full flex flex-col" : "flex flex-row h-48 md:h-56"
      )}>
        {/* Image Container */}
        <div className={cn(
          "relative bg-white flex items-center justify-center p-4",
          isGrid ? "aspect-square w-full" : "w-48 md:w-64 h-full shrink-0"
        )}>
          <div className="absolute top-0 left-0 z-10 flex flex-col items-start gap-1">
            {product.isBestDeal && (
               <div className="bg-yellow-400 text-yellow-950 text-[10px] font-black uppercase px-3 py-1 rounded-br-xl shadow-lg flex items-center gap-1">
                 <Star className="h-3 w-3 fill-yellow-950" />
                 Best Deal
               </div>
            )}
            {product.dealRating !== undefined && (
               <div className={cn(
                 "text-[10px] font-black uppercase px-3 py-1 rounded-br-xl shadow-lg flex items-center gap-1 mt-1",
                 product.dealRating >= 4 ? "bg-indigo-500 text-white" : product.dealRating >= 3 ? "bg-amber-500 text-white" : "bg-rose-500 text-white"
               )}>
                 <Sparkles className="h-3 w-3" />
                 AI Score: {product.dealRating * 2}/10
               </div>
            )}

          </div>
          <Badge className="absolute top-2 right-2 bg-emerald-500/90 hover:bg-emerald-600 border-none font-bold">
            {product.discount}% OFF
          </Badge>
          <Image
            src={product.image}
            alt={product.title}
            fill
            className="object-contain p-4 transition-transform duration-500 group-hover:scale-110"
          />
        </div>

        {/* Content Container */}
        <CardContent className={cn(
          "p-4 md:p-5 flex flex-col justify-between flex-1",
          isGrid ? "" : "border-l"
        )}>
          <div className="space-y-2">
            <div className="flex justify-between items-start gap-4">
               <div>
                 <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">{product.category}</span>
                 <h3 className={cn(
                   "font-bold leading-tight group-hover:text-primary transition-colors",
                   isGrid ? "line-clamp-2 mt-1" : "text-lg md:text-xl line-clamp-1"
                 )}>
                   {product.title}
                 </h3>
               </div>
               {product.rating && (
                 <div className="flex items-center gap-1 shrink-0 bg-muted px-2 py-0.5 rounded-full">
                   <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                   <span className="text-xs font-bold">{product.rating}</span>
                 </div>
               )}
            </div>

            <div className="flex items-center gap-2">
               <span className="text-2xl font-black">₹{product.price.toLocaleString()}</span>
               <span className="text-sm text-muted-foreground line-through">₹{product.mrp.toLocaleString()}</span>
               <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                 Save ₹{(product.mrp - product.price).toLocaleString()}
               </span>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-1">
               <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                 <Truck className="h-3.5 w-3.5 text-primary" />
                 {product.deliveryTime}
               </div>
               <div className="w-1 h-1 rounded-full bg-muted-foreground/30" />
               <span className={cn(
                 "text-[11px] font-bold",
                 product.stockStatus === "In stock" ? "text-emerald-500" : "text-orange-500"
               )}>
                 {product.stockStatus}
               </span>
            </div>
          </div>

          <div className="flex items-center justify-between mt-4 pt-4 border-t gap-4">
             <div className="flex items-center gap-2 overflow-hidden">
                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center border shrink-0">
                  <span className="text-[11px] font-black text-primary">{product.platform[0]}</span>
                </div>
                <span className="text-xs font-bold truncate">{product.platform}</span>
             </div>
             <div className="flex items-center gap-2">
               <Button
                  variant="outline"
                  className="rounded-xl h-9 px-3 font-bold border-indigo-500/20 text-indigo-600 hover:bg-indigo-500/5 group/ai relative overflow-hidden"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsAIModalOpen(true);
                  }}
               >
                 <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 opacity-0 group-hover/ai:opacity-100 transition-opacity" />
                 <Sparkles className="w-3.5 h-3.5 mr-1.5 text-indigo-500 animate-pulse" />
                 Ask AI
               </Button>
               <Button
                  variant="outline"
                  size="icon"
                  className="rounded-xl h-9 w-9 shrink-0 border-indigo-500/20 text-indigo-600 hover:bg-indigo-500/10"
                  onClick={handleAddToCart}
               >
                 <ShoppingCart className="h-4 w-4" />
               </Button>
               <Button 
                  asChild
                  className="rounded-xl h-9 px-4 font-bold shrink-0"
                  onClick={(e) => e.stopPropagation()}
               >
                  <a href={product.url} target="_blank" rel="noopener noreferrer">
                    Buy
                    <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
                  </a>
               </Button>
             </div>
             
             <AIDealInsightModal 
               isOpen={isAIModalOpen}
               onOpenChange={setIsAIModalOpen}
               product={product}
             />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
