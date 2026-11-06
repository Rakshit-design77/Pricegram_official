"use client";

import Link from "next/link";
import { Facebook, Twitter, Instagram, Linkedin, Send, Mail, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Footer() {
  return (
    <footer className="w-full bg-[#050505] text-white border-t border-white/5 pt-20 pb-10 overflow-hidden relative">
      {/* Background Glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16 mb-20">
          {/* Brand Column */}
          <div className="space-y-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white font-black text-xl shadow-[0_0_20px_rgba(16,185,129,0.3)]">P</div>
              <span className="text-2xl font-black uppercase tracking-tighter">PriceGram</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
              India's fastest real-time price comparison engine. 
              <span className="block mt-2 font-bold text-primary italic">"We don't sell, we compare."</span>
            </p>
            <div className="flex items-center gap-4">
              <SocialLink href="#" icon={Twitter} />
              <SocialLink href="https://instagram.com/rakshitgarg17" icon={Instagram} />
              <SocialLink href="https://www.linkedin.com/in/rakshit-garg-96a1631b0" icon={Linkedin} />
              <SocialLink href="#" icon={Facebook} />
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-8">
            <h4 className="text-xs font-black uppercase tracking-[0.3em] text-primary">Explore</h4>
            <ul className="space-y-4">
              <FooterLink href="/">Home</FooterLink>
              <FooterLink href="/coupons">Coupons Hub</FooterLink>
              <FooterLink href="/premium">Premium Pricing</FooterLink>
              <FooterLink href="/blog">Guides & Blog</FooterLink>
            </ul>
          </div>

          {/* Legal Links */}
          <div className="space-y-8">
            <h4 className="text-xs font-black uppercase tracking-[0.3em] text-primary">Support</h4>
            <ul className="space-y-4">
              <FooterLink href="/disclaimer">Disclaimer</FooterLink>
              <FooterLink href="/privacy">Privacy Policy</FooterLink>
              <FooterLink href="/terms">Terms of Service</FooterLink>
              <FooterLink href="/admin">Admin Moderation</FooterLink>
            </ul>
          </div>

          {/* Newsletter Column */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h4 className="text-xs font-black uppercase tracking-[0.3em] text-primary">Stay Updated</h4>
              <p className="text-gray-400 text-sm">Join 5,000+ smart shoppers for weekly deal alerts.</p>
            </div>
            <div className="relative group">
              <Input 
                className="bg-white/5 border-white/10 focus-visible:border-primary/50 h-14 pl-5 pr-14 rounded-2xl text-sm placeholder:text-gray-500" 
                placeholder="Enter your email"
              />
              <Button size="icon" className="absolute right-1.5 top-1.5 h-11 w-11 rounded-xl bg-primary hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
                <Send size={18} />
              </Button>
            </div>
            <div className="flex items-center gap-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Real-time engine active</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col items-center md:items-start gap-1">
            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">© 2026 PriceGram India. All rights reserved.</p>
            <p className="text-gray-600 text-[10px] font-bold uppercase tracking-[0.2em]">Designed & Developed by Rakshit Garg</p>
          </div>
          
          <div className="flex items-center gap-8 grayscale opacity-50">
             <div className="text-[10px] font-black tracking-tighter uppercase border border-white/10 px-3 py-1 rounded">Secure Payments</div>
             <div className="text-[10px] font-black tracking-tighter uppercase border border-white/10 px-3 py-1 rounded">Real-time Data</div>
          </div>
        </div>
      </div>
    </footer>
  );
}

function SocialLink({ href, icon: Icon }: { href: string; icon: any }) {
  return (
    <a 
      href={href} 
      target="_blank" 
      rel="noopener noreferrer"
      className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-all duration-300"
    >
      <Icon size={18} />
    </a>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link 
        href={href} 
        className="text-gray-400 text-sm font-medium hover:text-white hover:translate-x-1 transition-all duration-300 inline-block"
      >
        {children}
      </Link>
    </li>
  );
}
