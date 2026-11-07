"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MapPin, Navigation, Loader2, X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface LocationModalProps {
  isOpen: boolean;
  required?: boolean;
  onClose: () => void;
  currentLocation: string;
  onLocationChange: (location: string) => void;
  onCoordinatesChange: (coordinates: { latitude: number; longitude: number }) => void;
}

export function LocationModal({ 
  isOpen, 
  required = false,
  onClose, 
  currentLocation, 
  onLocationChange,
  onCoordinatesChange
}: LocationModalProps) {
  const [pincode, setPincode] = useState("");
  const [isDetecting, setIsDetecting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [locationError, setLocationError] = useState("");
  const detectionRequest = useRef(0);
  useEffect(() => {
    detectionRequest.current++;
    setIsDetecting(false);
    setLocationError('');
    setPincode('');
    return () => { detectionRequest.current++; };
  }, [isOpen]);
  const close = () => { detectionRequest.current++; setIsDetecting(false); onClose(); };

  const handleDetectLocation = () => {
    const request = ++detectionRequest.current;
    setIsDetecting(true);
    setLocationError("");
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          if (request !== detectionRequest.current) return;
          onCoordinatesChange({ latitude: position.coords.latitude, longitude: position.coords.longitude });
          setIsDetecting(false);
          onClose();
        },
        (error) => {
          if (request !== detectionRequest.current) return;
          console.error("Geolocation error:", error);
          setIsDetecting(false);
          setLocationError("Could not access your location. Please enter a pincode.");
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    } else {
      setIsDetecting(false);
      setLocationError("Location detection is unavailable. Please enter a pincode.");
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (/^[1-9]\d{5}$/.test(pincode)) {
      detectionRequest.current++;
      setIsDetecting(false);
      setIsSaving(true);
      onLocationChange(pincode);
      setIsSaving(false);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={open => { if (!open && !required) close(); }}>
      <DialogContent className="bg-card w-[calc(100%-2rem)] max-w-md rounded-[2.5rem] sm:rounded-[2.5rem] p-0 gap-0 shadow-2xl overflow-hidden max-h-[95dvh] overflow-y-auto [&>button]:hidden">
        <div className="p-8 space-y-6">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <DialogTitle className="text-2xl font-black tracking-tight uppercase italic">Set <span className="text-primary">Location</span></DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground font-medium">Choose your delivery location to start comparing products.</DialogDescription>
            </div>
            {!required && <Button variant="ghost" size="icon" onClick={close} aria-label="Close location picker" className="rounded-full hover:bg-muted">
              <X className="h-5 w-5" />
            </Button>}
          </div>

          {/* Current Location Display */}
          <div className="flex items-center gap-4 p-5 bg-muted/50 rounded-3xl border-2 border-dashed border-primary/20">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <MapPin className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Delivering to</p>
              <p className="text-lg font-black text-primary tracking-tight">{currentLocation || 'Choose a location'}</p>
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
          {locationError && <p role="alert" className="text-sm text-destructive">{locationError}</p>}
          <form onSubmit={handleManualSubmit} className="space-y-4">
            <div className="relative">
              <Input 
                placeholder="Enter pincode"
                aria-label="Delivery pincode"
                inputMode="numeric"
                autoComplete="postal-code"
                maxLength={6}
                value={pincode}
                onChange={(e) => setPincode(e.target.value.replace(/\D/g, ""))}
                className="h-16 rounded-[1.5rem] text-xl font-black text-center tracking-[0.5em] focus-visible:ring-primary border-muted-foreground/20 bg-muted/30"
              />
            </div>
            <Button 
              type="submit" 
              variant="secondary" 
              disabled={!/^[1-9]\d{5}$/.test(pincode) || isSaving}
              className="w-full h-16 rounded-[1.5rem] font-black text-xs uppercase tracking-widest transition-all hover:bg-secondary/80"
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Set Manual Location"}
            </Button>
          </form>
        </div>
        
        <div className="bg-primary/5 p-4 text-center border-t border-primary/10">
          <p className="text-xs text-primary/80">Availability depends on your delivery location and each store.</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
