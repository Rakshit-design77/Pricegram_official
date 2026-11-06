"use client";

import { useState, useEffect } from "react";
import { Check, ShieldCheck, Sparkles, AlertCircle, Award, CreditCard, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export default function PremiumPage() {
  const { toast } = useToast();
  const [isPremium, setIsPremium] = useState(false);
  const [checkoutPlan, setCheckoutPlan] = useState<{ name: string; price: string } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Stripe integration pending

  useEffect(() => {
    const status = localStorage.getItem("pricegram_premium") === "true";
    setIsPremium(status);
  }, []);

  const handleCheckoutOpen = (planName: string, planPrice: string) => {
    setCheckoutPlan({ name: planName, price: planPrice });
  };

  const handleMockPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    // Simulate Stripe Gateway processing delay
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      localStorage.setItem("pricegram_premium", "true");
      setIsPremium(true);

      toast({
        title: "Subscription Activated!",
        description: `Thank you! You are now subscribed to the PriceGram ${checkoutPlan?.name} plan.`,
      });

      // Close modal after success display
      setTimeout(() => {
        setCheckoutPlan(null);
        setIsSuccess(false);
      }, 2000);
    }, 2500);
  };

  const cancelSubscription = () => {
    localStorage.removeItem("pricegram_premium");
    setIsPremium(false);
    toast({
      title: "Subscription Cancelled",
      description: "You have reverted to the Free Tier.",
    });
  };

  const features = [
    { name: "Priority Real-Time Alerts", description: "Get price drop updates in seconds rather than hours." },
    { name: "WhatsApp Notification Hub", description: "Direct messaging alert alerts on your phone." },
    { name: "100% Ad-Free Experience", description: "Clean UI with no banners or third-party ads." },
    { name: "Exclusive Premium Coupons", description: "Unlock special members-only promo codes." },
    { name: "Price-Drop Guarantee", description: "We reimburse you if a deals alerts doesn't trigger correctly." }
  ];

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl space-y-12">
      {/* Hero Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-black uppercase tracking-widest">
          <Award className="h-4 w-4" /> PriceGram Gold Memberships
        </div>
        <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none">
          Unlock Unlimited <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Savings</span>
        </h1>
        <p className="text-muted-foreground text-base md:text-lg font-semibold leading-relaxed">
          Take your shopping intelligence to the next level. Join 5,000+ Indian smart shoppers tracking prices across 15+ quick commerce and retail sites.
        </p>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch max-w-4xl mx-auto pt-6">
        
        {/* Free Plan */}
        <div className="bg-card border rounded-[2.5rem] p-8 flex flex-col justify-between space-y-6 relative">
          <div className="space-y-4">
            <span className="text-xs font-black uppercase tracking-widest text-muted-foreground block">Free Tier</span>
            <div className="flex items-baseline">
              <span className="text-4xl font-black">₹0</span>
              <span className="text-sm font-bold text-muted-foreground ml-1">/ forever</span>
            </div>
            <p className="text-xs text-muted-foreground font-semibold">
              Essential price searching and basic tracking for occasional buyers.
            </p>
            <ul className="space-y-3 pt-4 border-t">
              <li className="flex items-start gap-2 text-xs font-semibold">
                <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Search up to 10 products daily</span>
              </li>
              <li className="flex items-start gap-2 text-xs font-semibold">
                <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Email alerts on price drops</span>
              </li>
            </ul>
          </div>
          <Button variant="outline" className="w-full rounded-2xl h-12 font-bold" disabled>
            Current Plan
          </Button>
        </div>

        {/* Monthly Plan (Popular) */}
        <div className="bg-card border-2 border-primary rounded-[2.5rem] p-8 flex flex-col justify-between space-y-6 relative shadow-xl shadow-primary/5">
          <div className="absolute top-0 right-8 -translate-y-1/2">
            <Badge className="bg-primary hover:bg-primary text-white font-black text-[9px] uppercase tracking-widest px-3 py-1">
              Popular Choice
            </Badge>
          </div>
          
          <div className="space-y-4">
            <span className="text-xs font-black uppercase tracking-widest text-primary block">Gold Monthly</span>
            <div className="flex items-baseline">
              <span className="text-4xl font-black">₹99</span>
              <span className="text-sm font-bold text-muted-foreground ml-1">/ month</span>
            </div>
            <p className="text-xs text-muted-foreground font-semibold">
              Full access to priority real-time tracking, WhatsApp alerts, and discount codes.
            </p>
            <ul className="space-y-3 pt-4 border-t">
              {features.slice(0, 4).map((f, i) => (
                <li key={i} className="flex items-start gap-2 text-xs font-semibold">
                  <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{f.name}</span>
                </li>
              ))}
            </ul>
          </div>

          {isPremium ? (
            <Button variant="outline" className="w-full rounded-2xl h-12 font-bold border-rose-500/20 text-rose-500 hover:bg-rose-500/5" onClick={cancelSubscription}>
              Cancel Plan
            </Button>
          ) : (
            <Button className="w-full rounded-2xl h-12 font-black bg-primary shadow-lg shadow-primary/20" onClick={() => handleCheckoutOpen("Gold Monthly", "₹99")}>
              Subscribe Now
            </Button>
          )}
        </div>

        {/* Annual Plan (Best Value) */}
        <div className="bg-card border rounded-[2.5rem] p-8 flex flex-col justify-between space-y-6 relative">
          <div className="space-y-4">
            <span className="text-xs font-black uppercase tracking-widest text-secondary block">Gold Annual</span>
            <div className="flex items-baseline">
              <span className="text-4xl font-black">₹999</span>
              <span className="text-sm font-bold text-muted-foreground ml-1">/ year</span>
            </div>
            <p className="text-xs text-muted-foreground font-semibold">
              Maximize your savings. Save 15% compared to the monthly subscription.
            </p>
            <ul className="space-y-3 pt-4 border-t">
              {features.map((f, i) => (
                <li key={i} className="flex items-start gap-2 text-xs font-semibold">
                  <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{f.name}</span>
                </li>
              ))}
            </ul>
          </div>

          {isPremium ? (
            <Button variant="outline" className="w-full rounded-2xl h-12 font-bold border-rose-500/20 text-rose-500 hover:bg-rose-500/5" onClick={cancelSubscription}>
              Cancel Plan
            </Button>
          ) : (
            <Button className="w-full rounded-2xl h-12 font-black bg-secondary text-secondary-foreground" onClick={() => handleCheckoutOpen("Gold Annual", "₹999")}>
              Get Annual Plan
            </Button>
          )}
        </div>

      </div>

      {/* FAQ & Trust Section */}
      <div className="pt-12 border-t max-w-4xl mx-auto space-y-6">
        <h3 className="text-xl font-black uppercase tracking-wider text-center">Frequently Asked Questions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-card border rounded-[2rem] space-y-2">
            <h4 className="font-bold text-sm">How does the WhatsApp price alert work?</h4>
            <p className="text-xs text-muted-foreground font-semibold">
              When a tracked item falls below your alert price threshold, our automation engines push a WhatsApp alert message to your mobile immediately.
            </p>
          </div>
          <div className="p-6 bg-card border rounded-[2rem] space-y-2">
            <h4 className="font-bold text-sm">Can I cancel my membership at any time?</h4>
            <p className="text-xs text-muted-foreground font-semibold">
              Yes, absolutely! There are no long-term contracts. You can cancel with a single tap in your membership profile page.
            </p>
          </div>
        </div>
      </div>

      {/* Stripe Interactive Dialog */}
      <Dialog open={!!checkoutPlan} onOpenChange={() => setCheckoutPlan(null)}>
        <DialogContent className="max-w-md p-6 rounded-[2rem] border shadow-2xl">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary animate-pulse" />
              Stripe Secure Payment
            </DialogTitle>
            <DialogDescription className="text-xs font-semibold">
              You are subscribing to PriceGram <span className="font-black text-foreground">{checkoutPlan?.name}</span> for {checkoutPlan?.price}.
            </DialogDescription>
          </DialogHeader>

          {isSuccess ? (
            <div className="flex flex-col items-center justify-center py-10 text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500">
                <ShieldCheck className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-black text-emerald-500">Payment Completed!</h3>
              <p className="text-xs text-muted-foreground font-semibold">Your premium status is being synchronized...</p>
            </div>
          ) : (
            <form onSubmit={handleMockPayment} className="space-y-4 pt-3">
              <div className="p-4 bg-muted/30 border rounded-xl space-y-3">
                <p className="text-xs text-muted-foreground font-semibold">
                  Live Stripe integration is pending. For now, click the button below to simulate a successful payment and activate premium.
                </p>
              </div>

              <Button
                type="submit"
                disabled={isProcessing}
                className="w-full h-12 rounded-xl font-black uppercase tracking-wider text-xs bg-primary shadow-lg shadow-primary/10 mt-2"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                    Processing Payment...
                  </>
                ) : (
                  `Pay ${checkoutPlan?.price} & Subscribe`
                )}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
