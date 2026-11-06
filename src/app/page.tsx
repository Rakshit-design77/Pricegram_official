import { Hero } from "@/components/home/Hero";
import { CategoryList } from "@/components/home/CategoryList";
import { TrendingProducts } from "@/components/home/TrendingProducts";
import { HowItWorks } from "@/components/home/HowItWorks";
import { SmartFeatures } from "@/components/home/SmartFeatures";
import { Testimonials } from "@/components/home/Testimonials";
import { TrustSection } from "@/components/home/TrustSection";
import { StartSaving } from "@/components/home/StartSaving";
import Image from "next/image";

export default function Home() {
  const platforms = [
    { name: "Amazon", color: "text-[#FF9900]" },
    { name: "Flipkart", color: "text-[#2874F0]" },
    { name: "Blinkit", color: "text-[#FFCC00]" },
    { name: "Zepto", color: "text-[#8B008B]" },
    { name: "Instamart", color: "text-[#FC8019]" },
    { name: "BigBasket", color: "text-[#689f38]" },
    { name: "Flipkart Minutes", color: "text-[#2874F0]" }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Hero />
      
      <CategoryList />
      
      <TrustSection />
      
      <TrendingProducts />

      <HowItWorks />

      <SmartFeatures />

      <Testimonials />

      <StartSaving />

    </div>
  );
}
