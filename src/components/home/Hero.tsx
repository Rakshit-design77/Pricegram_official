"use client";

import { Search, Mic, MapPin, ChevronDown, ShoppingBag, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@/store/useStore";
import { LocationModal } from "@/components/location/LocationModal";

export function Hero() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const { location, setLocation, setDetectedLocation } = useStore();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  const popularSearches = [
    { name: "Milk", icon: "🥛" },
    { name: "iPhone 16", icon: "📱" },
    { name: "Atta 10kg", icon: "🌾" },
    { name: "Maggi", icon: "🍜" },
    { name: "Sunscreen", icon: "☀️" }
  ];

  return (
    <>
      <section className="relative w-full pt-20 pb-16 md:pt-32 md:pb-24 lg:pt-40 lg:pb-32 overflow-hidden bg-background">
        {/* Dynamic Background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-[10%] right-[-10%] w-[50%] h-[50%] bg-secondary/10 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '2s' }} />
          </div>
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cartographer.png')]" />
        </div>

        <div className="container relative z-10 mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-8 md:space-y-12">
            {/* Animated Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary font-bold text-xs uppercase tracking-widest"
            >
              <Sparkles size={14} className="animate-spin-slow" />
              <span>Real-time Price Engine Active</span>
            </motion.div>

            {/* Main Headline */}
            <div className="space-y-4">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.9] uppercase"
              >
                Sabse Sasta, <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary to-secondary drop-shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                  Sabse Tez
                </span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-muted-foreground text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed"
              >
                10+ platforms pe real-time price compare karo.
              </motion.p>
            </div>

            {/* Search Hub */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="relative max-w-3xl mx-auto"
            >
              <div className="bg-card/80 backdrop-blur-xl border border-border shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] rounded-[2.5rem] p-2 md:p-3">
                <form onSubmit={handleSearch} className="flex flex-col md:flex-row items-center gap-2">
                  {/* Location Selector */}
                  <div 
                    onClick={() => setIsLocationModalOpen(true)}
                    className="flex items-center gap-3 px-6 py-3 md:py-0 h-full min-w-[180px] bg-muted/50 md:bg-transparent rounded-3xl md:rounded-none md:border-r border-border cursor-pointer group hover:bg-muted/30 transition-all w-full md:w-auto"
                  >
                    <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary group-hover:scale-110 transition-transform">
                      <MapPin size={18} />
                    </div>
                    <div className="flex flex-col items-start">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Location</span>
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-black whitespace-nowrap">{location || 'Set location'}</span>
                        <ChevronDown size={14} className="text-muted-foreground" />
                      </div>
                    </div>
                  </div>

                  {/* Search Input */}
                  <div className="relative flex-1 w-full">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Doodh, iPhone, ya Atta search karo..."
                      className="w-full h-16 md:h-14 pl-14 pr-12 border-none bg-transparent focus-visible:ring-0 text-lg font-medium placeholder:text-muted-foreground/60"
                    />
                    <Button variant="ghost" size="icon" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary rounded-full">
                      <Mic className="h-5 w-5" />
                    </Button>
                  </div>

                  {/* Search Button */}
                  <Button 
                    type="submit" 
                    size="lg" 
                    className="w-full md:w-auto h-16 md:h-14 rounded-[1.8rem] px-10 font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all bg-primary"
                  >
                    Dhoondo
                  </Button>
                </form>
              </div>

              {/* Popular Search Chips */}
              <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mr-2">Trending:</span>
                {popularSearches.map((item, idx) => (
                  <motion.button
                    key={item.name}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + idx * 0.1 }}
                    onClick={() => setQuery(item.name)}
                    className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-full text-xs font-bold hover:border-primary/50 hover:bg-primary/5 hover:text-primary transition-all shadow-sm"
                  >
                    <span>{item.icon}</span>
                    {item.name}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
        
        <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-background to-transparent pointer-events-none" />
      </section>

      <LocationModal 
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        currentLocation={location || 'Set location'}
        onLocationChange={setLocation}
        onCoordinatesChange={setDetectedLocation}
      />
    </>
  );
}
