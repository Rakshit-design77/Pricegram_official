"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Platform, Category } from "@/types";

const platforms: Platform[] = ["Amazon", "Flipkart", "Blinkit", "Zepto", "Swiggy Instamart", "BigBasket"];
const categories: Category[] = ["Grocery & Essentials", "Electronics", "Fashion", "Home & Kitchen", "Beauty", "Mobiles"];

interface FiltersProps {
  selectedPlatforms: string[];
  setSelectedPlatforms: (platforms: string[]) => void;
  selectedCategories: string[];
  setSelectedCategories: (categories: string[]) => void;
  priceRange: [number, number];
  setPriceRange: (range: [number, number]) => void;
}

export function Filters({
  selectedPlatforms,
  setSelectedPlatforms,
  selectedCategories,
  setSelectedCategories,
  priceRange,
  setPriceRange,
}: FiltersProps) {
  
  const togglePlatform = (platform: string) => {
    if (selectedPlatforms.includes(platform)) {
      setSelectedPlatforms(selectedPlatforms.filter(p => p !== platform));
    } else {
      setSelectedPlatforms([...selectedPlatforms, platform]);
    }
  };

  const toggleCategory = (category: string) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter(c => c !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold mb-4">Filters</h3>
        <Accordion type="multiple" defaultValue={["platforms", "categories", "price"]}>
          
          <AccordionItem value="platforms">
            <AccordionTrigger className="text-sm font-bold">Platform</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3 pt-1">
                {platforms.map((platform) => (
                  <div key={platform} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`platform-${platform}`} 
                      checked={selectedPlatforms.includes(platform)}
                      onCheckedChange={() => togglePlatform(platform)}
                    />
                    <Label htmlFor={`platform-${platform}`} className="text-sm cursor-pointer">{platform}</Label>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="categories">
            <AccordionTrigger className="text-sm font-bold">Category</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3 pt-1">
                {categories.map((category) => (
                  <div key={category} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`category-${category}`} 
                      checked={selectedCategories.includes(category)}
                      onCheckedChange={() => toggleCategory(category)}
                    />
                    <Label htmlFor={`category-${category}`} className="text-sm cursor-pointer">{category}</Label>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="price">
            <AccordionTrigger className="text-sm font-bold">Price Range</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 pt-2 px-1">
                <Slider 
                  value={[priceRange[1]]} 
                  max={200000} 
                  step={1000} 
                  onValueChange={(val) => setPriceRange([0, val[0]])}
                />
                <div className="flex items-center justify-between text-xs font-bold text-primary">
                  <span>{priceRange[1] >= 200000 ? "Unlimited" : `Up to ₹${priceRange[1].toLocaleString()}`}</span>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

        </Accordion>
      </div>
    </div>
  );
}
