"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Search, MapPin, Menu, User, LogIn, Sparkles, ShoppingCart } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useStore } from "@/store/useStore";
import { useCartStore } from "@/store/cartStore";
import { LocationModal } from "@/components/location/LocationModal";
import { 
  SignInButton, 
  SignUpButton, 
  UserButton, 
  SignedIn, 
  SignedOut 
} from "@clerk/nextjs";

export function Navbar() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isSmartSearch, setIsSmartSearch] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const { location, setLocation } = useStore();
  
  // Cart state
  const items = useCartStore(state => state.items);
  const setIsCartOpen = useCartStore(state => state.setIsCartOpen);
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}${isSmartSearch ? '&smart=true' : ''}`);
    }
  };

  return (
    <>
      <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center mx-auto px-4 justify-between">
          {/* Mobile Menu & Logo Container */}
          <div className="flex items-center gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[400px] p-0">
                <div className="p-6 border-b">
                  <Link href="/" className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-black">P</div>
                    <span className="font-bold text-xl tracking-tighter">PriceGram</span>
                  </Link>
                </div>
                <div className="p-6 space-y-6">
                  <div className="space-y-4">
                    <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Menu</h4>
                    <nav className="flex flex-col gap-4">
                      <MobileLink href="/" onOpenChange={() => {}}>Home</MobileLink>
                      <MobileLink href="/coupons" onOpenChange={() => {}}>Coupons</MobileLink>
                      <MobileLink href="/premium" onOpenChange={() => {}}>Premium Tier</MobileLink>
                      <MobileLink href="/blog" onOpenChange={() => {}}>Smart Blog</MobileLink>
                      <MobileLink href="/dashboard" onOpenChange={() => {}}>My Dashboard</MobileLink>
                      <MobileLink href="/admin" onOpenChange={() => {}}>Admin Portal</MobileLink>
                    </nav>
                  </div>
                  <div className="space-y-4 pt-6 border-t">
                    <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Account</h4>
                    <div className="flex flex-col gap-4">
                      <button 
                        onClick={() => setIsLocationModalOpen(true)}
                        className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors"
                      >
                        <MapPin className="h-4 w-4 text-primary" />
                        <span>{location}</span>
                      </button>
                      <SignedOut>
                        <SignInButton mode="modal">
                          <Button className="w-full justify-start gap-2" variant="outline">
                            <LogIn className="h-4 w-4" />
                            Login / Sign Up
                          </Button>
                        </SignInButton>
                      </SignedOut>
                      <SignedIn>
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <UserButton afterSignOutUrl="/" />
                          <span>My Account</span>
                        </div>
                      </SignedIn>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
            
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-black">P</div>
              <span className="font-bold text-lg md:text-xl tracking-tighter">PriceGram</span>
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-6 text-xs font-black uppercase tracking-wider mx-6 shrink-0">
            <Link href="/coupons" className="hover:text-primary transition-colors">Coupons</Link>
            <Link href="/premium" className="hover:text-primary transition-colors">Premium</Link>
            <Link href="/blog" className="hover:text-primary transition-colors">Blog</Link>
            <Link href="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link>
            <Link href="/admin" className="hover:text-primary transition-colors">Admin</Link>
          </div>

          {/* Desktop Search Bar */}
          <div className="flex-1 hidden lg:flex items-center justify-center max-w-xl px-4 gap-3">
            <form onSubmit={handleSearch} className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full bg-muted/50 pl-10 rounded-full border-muted-foreground/10 focus-visible:ring-primary h-10"
              />
            </form>
            <div className="flex items-center gap-2 shrink-0">
               <Switch 
                 id="smart-search" 
                 checked={isSmartSearch}
                 onCheckedChange={setIsSmartSearch}
                 className="data-[state=checked]:bg-indigo-500"
               />
               <label htmlFor="smart-search" className="text-xs font-black uppercase tracking-widest text-indigo-500 cursor-pointer flex items-center gap-1">
                 <Sparkles className="w-3 h-3" /> Smart
               </label>
            </div>
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            <Button 
              variant="ghost" 
              onClick={() => setIsLocationModalOpen(true)}
              className="hidden sm:flex items-center gap-1 text-xs font-bold text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-full border hover:bg-muted/50 transition-all"
            >
              <MapPin className="h-3 w-3 text-primary" />
              <span>{location}</span>
            </Button>
            
            {/* Smart Cart Toggle */}
            <Button
              variant="outline"
              size="icon"
              className="relative rounded-full hover:bg-primary/5 hover:text-primary transition-colors border-primary/20"
              onClick={() => setIsCartOpen(true)}
            >
              <ShoppingCart className="h-4 w-4" />
              {mounted && items.length > 0 && (
                <div className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-background">
                  {items.length}
                </div>
              )}
            </Button>
            
            <div className="hidden md:block w-px h-6 bg-border mx-2"></div>
            
            <SignedOut>
              <SignInButton mode="modal">
                <Button className="hidden md:flex gap-2 rounded-full px-6 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">
                  <LogIn className="h-4 w-4" />
                  Login
                </Button>
              </SignInButton>
              <SignInButton mode="modal">
                <Button variant="ghost" size="icon" className="relative md:hidden">
                  <User className="h-5 w-5" />
                </Button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </div>
        </div>
      </nav>

      <LocationModal 
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        currentLocation={location}
        onLocationChange={setLocation}
      />
    </>
  );
}

interface MobileLinkProps extends React.PropsWithChildren {
  href: string;
  onOpenChange?: (open: boolean) => void;
  className?: string;
}

function MobileLink({
  href,
  onOpenChange,
  className,
  children,
  ...props
}: MobileLinkProps) {
  return (
    <Link
      href={href}
      onClick={() => {
        onOpenChange?.(false);
      }}
      className={`text-sm font-semibold hover:text-primary transition-colors ${className}`}
      {...props}
    >
      {children}
    </Link>
  );
}
