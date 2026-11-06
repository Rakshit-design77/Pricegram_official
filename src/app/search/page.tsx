"use client";

import { useState, useEffect, Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Filters } from "@/components/search/Filters";
import { ProductCard } from "@/components/search/ProductCard";
import { Product } from "@/types";
import { Button } from "@/components/ui/button";
import { LayoutGrid, List, SlidersHorizontal, ChevronDown, Loader2 } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ProductDetailModal } from "@/components/product/ProductDetailModal";
import { Skeleton } from "@/components/ui/skeleton";

function SearchPageContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || searchParams.get("category") || "";
  const initialCategory = searchParams.get("category") || "";
  const isSmartEnabled = searchParams.get("smart") === "true";
  
  const [allResults, setAllResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAIOptimizing, setIsAIOptimizing] = useState(false);
  const [optimizedQueryDisplay, setOptimizedQueryDisplay] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("Recommended");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Filter State
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(initialCategory ? [initialCategory] : []);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 200000]);

  useEffect(() => {
    async function fetchResults() {
      if (!query) return;
      
      setIsLoading(true);
      setIsAIOptimizing(true);
      setOptimizedQueryDisplay("");
      
      try {
        // 1. Optimize query using AI if enabled
        let finalQuery = query;
        if (isSmartEnabled) {
          try {
            const aiResponse = await fetch(`/api/ai/optimize-query?q=${encodeURIComponent(query)}`);
            if (aiResponse.ok) {
              const aiData = await aiResponse.json();
              finalQuery = aiData.optimizedQuery;
              if (finalQuery !== query && finalQuery !== "") {
                 setOptimizedQueryDisplay(finalQuery);
              }
              if (aiData.maxPrice && typeof aiData.maxPrice === 'number') {
                 setPriceRange([0, aiData.maxPrice]);
              }
              if (aiData.category && typeof aiData.category === 'string') {
                 setSelectedCategories([aiData.category]);
              }
            }
          } catch (e) {
            console.error("AI Optimization failed, falling back to original query:", e);
          }
        }
        setIsAIOptimizing(false);

        // 2. Fetch actual results
        const response = await fetch(`/api/search?q=${encodeURIComponent(finalQuery)}`);
        const data = await response.json();
        if (Array.isArray(data)) {
          setAllResults(data);
        } else {
          setAllResults([]);
        }
      } catch (error) {
        console.error("Failed to fetch search results:", error);
        setAllResults([]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchResults();
  }, [query]);

  // Derived filtered results
  const filteredResults = useMemo(() => {
    return allResults.filter(product => {
      // Platform filter
      if (selectedPlatforms.length > 0 && !selectedPlatforms.some(p => product.platform.toLowerCase().includes(p.toLowerCase()))) {
        return false;
      }
      
      // Category filter (relaxed for now as scrapers might not return exact categories)
      if (selectedCategories.length > 0 && product.category && !selectedCategories.includes(product.category)) {
        return false;
      }

      // Price filter - If at 200k, show everything above as well
      if (priceRange[1] < 200000 && product.price > priceRange[1]) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === "Price: Low to High") return a.price - b.price;
      if (sortBy === "Highest Discount") return b.discount - a.discount;
      return 0; // Default: Google's ranking
    });
  }, [allResults, selectedPlatforms, selectedCategories, priceRange, sortBy]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Sidebar - Desktop */}
        <aside className="hidden lg:block w-64 shrink-0 border-r pr-6">
          <Filters 
            selectedPlatforms={selectedPlatforms}
            setSelectedPlatforms={setSelectedPlatforms}
            selectedCategories={selectedCategories}
            setSelectedCategories={setSelectedCategories}
            priceRange={priceRange}
            setPriceRange={setPriceRange}
          />
        </aside>

        {/* Main Content */}
        <div className="flex-1 space-y-6">
          {/* Controls Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-4 rounded-2xl border shadow-sm">
            <div>
              <h1 className="text-xl font-bold flex flex-wrap items-center gap-2">
                {isLoading && !isAIOptimizing ? "Searching for" : "Search results for"} "{query || "..."}"
                {isAIOptimizing && (
                  <span className="text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded-full flex items-center gap-1 ml-2 animate-pulse">
                    <Loader2 className="h-3 w-3 animate-spin" /> ✨ AI Optimizing...
                  </span>
                )}
                {!isAIOptimizing && optimizedQueryDisplay && (
                  <span className="text-sm bg-blue-50 text-blue-600 px-2 py-1 rounded-full border border-blue-200 flex items-center ml-2">
                    ✨ AI Optimized to: "{optimizedQueryDisplay}"
                  </span>
                )}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {isLoading ? "Fetching real-time prices..." : `Showing ${filteredResults.length} relevant results`}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="lg:hidden gap-2">
                    <SlidersHorizontal className="h-4 w-4" />
                    Filters
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                  <div className="pt-6">
                    <Filters 
                      selectedPlatforms={selectedPlatforms}
                      setSelectedPlatforms={setSelectedPlatforms}
                      selectedCategories={selectedCategories}
                      setSelectedCategories={setSelectedCategories}
                      priceRange={priceRange}
                      setPriceRange={setPriceRange}
                    />
                  </div>
                </SheetContent>
              </Sheet>

              <div className="flex items-center gap-1 bg-muted p-1 rounded-lg">
                <Button 
                  variant={viewMode === "grid" ? "secondary" : "ghost"} 
                  size="icon" 
                  className="h-8 w-8 rounded-md"
                  onClick={() => setViewMode("grid")}
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button 
                  variant={viewMode === "list" ? "secondary" : "ghost"} 
                  size="icon" 
                  className="h-8 w-8 rounded-md"
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    {sortBy}
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setSortBy("Recommended")}>Recommended</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy("Price: Low to High")}>Price: Low to High</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy("Highest Discount")}>Highest Discount</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Results Grid/List */}
          {isLoading ? (
            <div className={
              viewMode === "grid" 
                ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6" 
                : "flex flex-col gap-4"
            }>
              {[...Array(6)].map((_, i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="aspect-square w-full rounded-2xl" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={
              viewMode === "grid" 
                ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6" 
                : "flex flex-col gap-4"
            }>
              {filteredResults.map((product) => (
                <div key={product.id} onClick={() => setSelectedProduct(product)} className="cursor-pointer">
                  <ProductCard product={product} viewMode={viewMode} />
                </div>
              ))}
            </div>
          )}

          {/* Product Detail Modal */}
          <ProductDetailModal 
            product={selectedProduct} 
            isOpen={!!selectedProduct} 
            onClose={() => setSelectedProduct(null)} 
          />

          {/* Empty State */}
          {!isLoading && filteredResults.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
               <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center">
                  <LayoutGrid className="h-10 w-10 text-muted-foreground" />
               </div>
               <h2 className="text-xl font-bold">No matching results found</h2>
               <p className="text-muted-foreground max-w-xs">Try adjusting your filters or search for something else.</p>
               <Button onClick={() => {
                 setSelectedPlatforms([]);
                 setSelectedCategories([]);
                 setPriceRange([0, 200000]);
               }}>Clear All Filters</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <SearchPageContent />
    </Suspense>
  );
}
