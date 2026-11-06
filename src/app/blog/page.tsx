"use client";

import Link from "next/link";
import { BookOpen, Calendar, Clock, ArrowRight, Tag, Bookmark } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface BlogPost {
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  readTime: string;
  date: string;
  image: string;
}

const POSTS: BlogPost[] = [
  {
    title: "Best Price on iPhone 16 in India Today: Amazon vs Flipkart vs Blinkit",
    slug: "iphone-16-best-price-today",
    excerpt: "Looking to buy the iPhone 16? We compared retail stores, e-commerce giants, and 10-minute quick commerce deliveries to find the absolute lowest price today.",
    category: "Mobiles",
    readTime: "5 mins read",
    date: "Jun 6, 2026",
    image: "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=500&auto=format&fit=crop"
  },
  {
    title: "Save Big on Groceries: Zepto vs Blinkit vs BigBasket Delivery Charges Compared",
    slug: "grocery-delivery-charges-compared",
    excerpt: "Hidden delivery fees, surge costs, and platform fees can double your grocery bill. We broke down the pricing structures of the top 3 quick commerce platforms in India.",
    category: "Groceries",
    readTime: "7 mins read",
    date: "May 28, 2026",
    image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop"
  },
  {
    title: "Top Electronics Deals This Month: How to Save up to 40% using Credit Cards",
    slug: "top-electronics-credit-card-deals",
    excerpt: "Banks are offering up to 10% instant cashback on laptops and smart televisions. Here is how to stack coupons and credit card discounts on Amazon and Flipkart.",
    category: "Electronics",
    readTime: "4 mins read",
    date: "May 20, 2026",
    image: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500&auto=format&fit=crop"
  }
];

export default function BlogPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl space-y-12">
      {/* Blog Hero */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-black uppercase tracking-wider">
          <BookOpen className="h-4 w-4" /> PriceGram Smart Shopping Hub
        </div>
        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-none">
          Smart Shopping Blogs & Guides
        </h1>
        <p className="text-muted-foreground text-sm font-semibold max-w-2xl mx-auto">
          Read guides on bank card stacking, platform commission discounts, and quick commerce delivery reviews.
        </p>
      </div>

      {/* Blog Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-6">
        {POSTS.map((post) => (
          <div
            key={post.slug}
            className="flex flex-col bg-card border rounded-[2.2rem] overflow-hidden hover:shadow-lg transition-all group"
          >
            {/* Image banner */}
            <div className="relative h-48 w-full bg-muted overflow-hidden">
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-4 left-4">
                <Badge className="bg-primary hover:bg-primary text-white font-black text-[10px] uppercase tracking-wider">
                  {post.category}
                </Badge>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {post.date}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {post.readTime}
                  </span>
                </div>

                <h2 className="text-lg font-black leading-snug group-hover:text-primary transition-colors line-clamp-2">
                  {post.title}
                </h2>

                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3 font-semibold">
                  {post.excerpt}
                </p>
              </div>

              <Button asChild className="w-full rounded-2xl font-black text-xs gap-1 mt-4" variant="secondary">
                <Link href={`/blog/${post.slug}`}>
                  Read Article <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
