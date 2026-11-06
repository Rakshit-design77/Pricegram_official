"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MapPin, Navigation, Loader2, X } from "lucide-react";

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLocation: string;
  onLocationChange: (location: string) => void;
}

export function LocationModal({ 
  isOpen, 
  onClose, 
  currentLocation, 
  onLocationChange 
}: LocationModalProps) {
  const [pincode, setPincode] = useState("");
  const [isDetecting, setIsDetecting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleDetectLocation = () => {
    setIsDetecting(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            // Simulate reverse geocoding
            setTimeout(() => {
              onLocationChange("Noida, 201301");
              setIsDetecting(false);
              onClose();
            }, 1500);
          } catch (error) {
            console.error("Geocoding error:", error);
            setIsDetecting(false);
          }
        },
        (error) => {
          console.error("Geolocation error:", error);
          setIsDetecting(false);
          alert("Could not access location. Please enter manually.");
        }
      );
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pincode.length === 6) {
      setIsSaving(true);
      setTimeout(() => {
        onLocationChange(`${pincode}`);
        setIsSaving(false);
        onClose();
      }, 800);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-card w-full max-w-md rounded-[2.5rem] border shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="p-8 space-y-6">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <h2 className="text-2xl font-black tracking-tight uppercase italic">Set <span className="text-primary">Location</span></h2>
              <p className="text-sm text-muted-foreground font-medium">Get local prices & faster delivery.</p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-muted">
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Current Location Display */}
          <div className="flex items-center gap-4 p-5 bg-muted/50 rounded-3xl border-2 border-dashed border-primary/20">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <MapPin className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Delivering to</p>
              <p className="text-lg font-black text-primary tracking-tight">{currentLocation}</p>
            </div>
          </div>

          {/* Auto Detect Button */}
          <Button 
            onClick={handleDetectLocation}
            disabled={isDetecting}
            className="w-full h-16 rounded-[1.5rem] gap-3 font-black text-xs uppercase tracking-widest transition-all hover:scale-[1.02] shadow-xl shadow-primary/20 bg-primary"
          >
            {isDetecting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Navigation className="h-4 w-4" />
            )}
            {isDetecting ? "Detecting..." : "Use Current Location"}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-muted-foreground/10" />
            </div>
            <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest">
              <span className="bg-card px-4 text-muted-foreground/60">Or Pincode Daalo</span>
            </div>
          </div>

          {/* Manual Input */}
          <form onSubmit={handleManualSubmit} className="space-y-4">
            <div className="relative">
              <Input 
                placeholder="201301" 
                maxLength={6}
                value={pincode}
                onChange={(e) => setPincode(e.target.value.replace(/\D/g, ""))}
                className="h-16 rounded-[1.5rem] text-xl font-black text-center tracking-[0.5em] focus-visible:ring-primary border-muted-foreground/20 bg-muted/30"
              />
            </div>
            <Button 
              type="submit" 
              variant="secondary" 
              disabled={pincode.length !== 6 || isSaving}
              className="w-full h-16 rounded-[1.5rem] font-black text-xs uppercase tracking-widest transition-all hover:bg-secondary/80"
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Set Manual Location"}
            </Button>
          </form>
        </div>
        
        <div className="bg-primary/5 p-4 text-center border-t border-primary/10">
          <p className="text-[10px] font-black uppercase tracking-widest text-primary/60">Currently Serving PAN India 🇮🇳</p>
        </div>
      </div>
    </div>
  );
}
