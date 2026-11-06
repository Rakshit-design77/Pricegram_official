"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Clock, Calendar, Bookmark, Share2, Sparkles, AlertCircle, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface PostContent {
  title: string;
  category: string;
  readTime: string;
  date: string;
  image: string;
  content: React.ReactNode;
}

const ARTICLES_CONTENT: Record<string, PostContent> = {
  "iphone-16-best-price-today": {
    title: "Best Price on iPhone 16 in India Today: Amazon vs Flipkart vs Blinkit",
    category: "Mobiles",
    readTime: "5 mins read",
    date: "Jun 6, 2026",
    image: "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=1000&auto=format&fit=crop",
    content: (
      <div className="space-y-6">
        <p className="text-base font-semibold leading-relaxed">
          The iPhone 16 is one of the most sought-after devices in India. However, pricing varies significantly between major e-commerce platforms and quick-commerce operations.
        </p>

        <h3 className="text-xl font-black uppercase tracking-tight pt-4">1. E-Commerce Platforms (Amazon vs Flipkart)</h3>
        <p className="text-sm text-muted-foreground font-semibold">
          Typically, Amazon and Flipkart offer competitive base prices, but the real savings come through bank card promotions. Amazon frequently partners with SBI Card and ICICI Bank to offer flat instant discounts of up to ₹5,000, while Flipkart works closely with HDFC Bank and Axis Bank.
        </p>

        <div className="p-4 bg-muted/30 border rounded-2xl space-y-2">
          <h4 className="font-bold text-sm text-primary">Pro-Tip for Card Stacking:</h4>
          <p className="text-xs text-muted-foreground font-semibold leading-relaxed">
            If you purchase via Flipkart, use the Flipkart Axis Credit Card to get 5% unlimited cashback. On Amazon, the Amazon Pay ICICI Credit Card offers 5% flat cashback for Prime members, which can yield additional savings.
          </p>
        </div>

        <h3 className="text-xl font-black uppercase tracking-tight pt-4">2. Quick Commerce (Blinkit vs Zepto)</h3>
        <p className="text-sm text-muted-foreground font-semibold">
          Surprisingly, quick commerce platforms like Blinkit and Zepto have partnered with official Apple resellers to deliver iPhones in under 10 minutes. While their base price is rarely lower than Amazon or Flipkart, they offer instant gratification. Additionally, Zepto has offered up to ₹10,000 off on select bank cards during high-volume sales.
        </p>

        <h3 className="text-xl font-black uppercase tracking-tight pt-4">Summary Verdict</h3>
        <p className="text-sm text-muted-foreground font-semibold">
          If you want the absolute lowest price and have an eligible credit card, Amazon or Flipkart remains the best choice. If you cannot wait and want the device delivered to your doorstep within minutes, Blinkit or Zepto is a viable option.
        </p>
      </div>
    )
  },
  "grocery-delivery-charges-compared": {
    title: "Save Big on Groceries: Zepto vs Blinkit vs BigBasket Delivery Charges Compared",
    category: "Groceries",
    readTime: "7 mins read",
    date: "May 28, 2026",
    image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=1000&auto=format&fit=crop",
    content: (
      <div className="space-y-6">
        <p className="text-base font-semibold leading-relaxed">
          Grocery prices are highly volatile, and quick commerce platforms charge various auxiliary fees like handling, surge, delivery, and packing charges that can inflate your order total.
        </p>

        <h3 className="text-xl font-black uppercase tracking-tight pt-4">1. Delivery Fees Breakdown</h3>
        <ul className="list-disc pl-5 text-sm text-muted-foreground font-semibold space-y-2">
          <li><strong>Blinkit:</strong> Offers free delivery on orders above ₹199 in most areas. However, handling fees of ₹4-9 and surge pricing during rain or high demand can add up.</li>
          <li><strong>Zepto:</strong> Free delivery starts at ₹149 for select loyalty members, otherwise standard ₹15-25 fee applies. Packing fees of ₹5-7 are standard.</li>
          <li><strong>BigBasket:</strong> For standard orders, free delivery starts at ₹499. For BB Now (quick delivery), rules match Zepto and Blinkit.</li>
        </ul>

        <h3 className="text-xl font-black uppercase tracking-tight pt-4">2. Product Markup Comparison</h3>
        <p className="text-sm text-muted-foreground font-semibold">
          While quick commerce offers delivery in under 15 minutes, base product markups are occasionally higher by 5-10% compared to local brick-and-mortar stores or larger online grocery apps like BigBasket.
        </p>

        <div className="p-4 bg-primary/5 border border-primary/20 rounded-2xl flex items-start gap-3">
          <Sparkles className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold text-sm text-foreground">AI Grocery Strategy:</h4>
            <p className="text-xs text-muted-foreground font-semibold leading-relaxed">
              Use PriceGram to run a live comparison before hitting buy. Stacking a coupon code (like ZEPTO50 or BLINKNEW) can offset additional delivery and packaging charges completely.
            </p>
          </div>
        </div>
      </div>
    )
  },
  "top-electronics-credit-card-deals": {
    title: "Top Electronics Deals This Month: How to Save up to 40% using Credit Cards",
    category: "Electronics",
    readTime: "4 mins read",
    date: "May 20, 2026",
    image: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=1000&auto=format&fit=crop",
    content: (
      <div className="space-y-6">
        <p className="text-base font-semibold leading-relaxed">
          Buying laptops, air conditioners, or washing machines? Bank credit cards and EMI options are the easiest way to slash hundreds of rupees off retail rates.
        </p>

        <h3 className="text-xl font-black uppercase tracking-tight pt-4">1. Stacking Instant Discounts</h3>
        <p className="text-sm text-muted-foreground font-semibold">
          Major brands coordinate with banks to provide instant cashbacks. For example, Samsung products on Flipkart offer flat instant discounts of up to ₹10,000 on ICICI Bank Cards.
        </p>

        <h3 className="text-xl font-black uppercase tracking-tight pt-4">2. No-Cost EMI Perks</h3>
        <p className="text-sm text-muted-foreground font-semibold">
          If you opt for No-Cost EMI, the platform provides an upfront discount equal to the interest charged by the bank. Stacking this with card discounts yields significant savings.
        </p>
      </div>
    )
  }
};

export default function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;
  const post = ARTICLES_CONTENT[slug];

  if (!post) {
    return (
      <div className="container mx-auto px-4 py-20 text-center space-y-4 max-w-md">
        <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto" />
        <h2 className="text-2xl font-black uppercase tracking-tighter">Article Not Found</h2>
        <p className="text-sm text-muted-foreground font-semibold">
          The requested blog post doesn't exist or has been removed.
        </p>
        <Button asChild rounded-full>
          <Link href="/blog">Back to Blog</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-3xl space-y-8">
      {/* Back Button */}
      <Button asChild variant="ghost" size="sm" className="rounded-full px-4 h-9 gap-1 text-xs font-bold self-start">
        <Link href="/blog">
          <ArrowLeft className="h-4 w-4" /> Back to Guides
        </Link>
      </Button>

      {/* Header details */}
      <div className="space-y-4">
        <Badge className="bg-primary hover:bg-primary text-white font-black text-xs uppercase tracking-wider px-3 py-1">
          {post.category}
        </Badge>
        <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight uppercase">
          {post.title}
        </h1>
        <div className="flex items-center gap-4 text-xs font-bold text-muted-foreground uppercase pt-2 border-b pb-4">
          <span className="flex items-center gap-1">
            <Calendar className="h-4 w-4" /> {post.date}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" /> {post.readTime}
          </span>
        </div>
      </div>

      {/* Main Banner Image */}
      <div className="relative h-[250px] md:h-[400px] rounded-[2.5rem] overflow-hidden border bg-muted">
        <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
      </div>

      {/* Article Content */}
      <article className="prose dark:prose-invert max-w-none text-foreground leading-relaxed">
        {post.content}
      </article>

      {/* Footer Banner */}
      <div className="p-6 bg-card border rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-4 mt-10">
        <div className="space-y-1 text-center md:text-left">
          <h4 className="font-black text-sm">Track Prices for Free!</h4>
          <p className="text-xs text-muted-foreground font-semibold">
            Track daily price reductions and never buy at higher rates again.
          </p>
        </div>
        <Button asChild className="rounded-xl font-black text-xs gap-1">
          <Link href="/">
            Compare Prices <ShoppingCart className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
