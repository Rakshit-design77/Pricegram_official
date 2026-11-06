"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, ShoppingCart, Zap } from "lucide-react";

export function StartSaving() {
  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        <div className="relative bg-primary rounded-[4rem] p-12 md:p-24 text-primary-foreground overflow-hidden shadow-[0_40px_100px_-15px_rgba(16,185,129,0.4)]">
           {/* Abstract Background Shapes */}
           <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/10 rounded-full blur-[120px] -mr-300 -mt-300" />
           <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-secondary/20 rounded-full blur-[100px] -ml-200 -mb-200" />
           
           <div className="relative z-10 flex flex-col items-center text-center space-y-10">
             <div className="w-20 h-20 rounded-3xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
               <Zap size={40} className="text-secondary fill-secondary" />
             </div>
             
             <div className="space-y-6 max-w-4xl">
               <h2 className="text-5xl md:text-8xl font-black uppercase tracking-tighter leading-[0.85]">
                 Ready to Stop <br /> 
                 <span className="text-secondary drop-shadow-[0_0_20px_rgba(249,115,22,0.4)]">Overpaying?</span>
               </h2>
               <p className="text-primary-foreground/80 text-xl font-medium max-w-2xl mx-auto">
                 Join thousands of smart shoppers in India. Start comparing real-time prices and save up to 40% on your monthly bills.
               </p>
             </div>

             <div className="flex flex-col sm:flex-row gap-6 w-full sm:w-auto">
               <Button 
                 size="lg" 
                 className="bg-white text-primary hover:bg-white/90 h-20 px-12 rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs shadow-2xl active:scale-95 transition-all"
                 onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
               >
                 Start Saving Now
                 <ArrowRight className="ml-3 h-5 w-5" />
               </Button>
               <Button 
                 size="lg" 
                 variant="outline"
                 className="bg-transparent border-white/20 hover:bg-white/10 h-20 px-12 rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs transition-all text-white"
               >
                 View Today's Deals
               </Button>
             </div>

             <div className="flex items-center gap-8 pt-10 border-t border-white/10 w-full justify-center opacity-60">
                <div className="flex flex-col items-center gap-1">
                   <span className="text-2xl font-black">50K+</span>
                   <span className="text-[10px] font-bold uppercase tracking-widest">Users</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                   <span className="text-2xl font-black">10+</span>
                   <span className="text-[10px] font-bold uppercase tracking-widest">Platforms</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                   <span className="text-2xl font-black">₹10Cr+</span>
                   <span className="text-[10px] font-bold uppercase tracking-widest">Saved</span>
                </div>
             </div>
           </div>
        </div>
      </div>
    </section>
  );
}
