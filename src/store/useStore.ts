import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Category, Platform } from '@/types'
import { hasDeliveryLocation } from '@/lib/deliveryLocation'

interface AppState {
  searchTerm: string
  setSearchTerm: (term: string) => void
  location: string
  setLocation: (loc: string) => void
  locationCoordinates: { latitude: number; longitude: number } | null
  setDetectedLocation: (coordinates: { latitude: number; longitude: number }) => void
  wishlist: string[]
  toggleWishlist: (productId: string) => void
  recentSearches: string[]
  addRecentSearch: (term: string) => void
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      searchTerm: '',
      setSearchTerm: (term) => set({ searchTerm: term }),
      location: '',
      locationCoordinates: null,
      setLocation: (loc) => { if (/^[1-9]\d{5}$/.test(loc)) set({ location: loc, locationCoordinates: null }) },
      setDetectedLocation: (coordinates) => { if (hasDeliveryLocation(coordinates)) set({ location: 'Current location', locationCoordinates: coordinates }) },
      wishlist: [],
      toggleWishlist: (productId) => 
        set((state) => ({
          wishlist: state.wishlist.includes(productId)
            ? state.wishlist.filter((id) => id !== productId)
            : [...state.wishlist, productId]
        })),
      recentSearches: [],
      addRecentSearch: (term) =>
        set((state) => ({
          recentSearches: [term, ...state.recentSearches.filter((t) => t !== term)].slice(0, 5)
        })),
    }),
    {
      name: 'pricegram-storage',
      version: 1,
      migrate: (saved) => {
        const state = (saved || {}) as Partial<AppState>;
        // Earlier versions silently assigned this default, so ask those users to confirm it.
        if (state.location === '201310' && !state.locationCoordinates) return { ...state, location: '', locationCoordinates: null };
        return state;
      },
    }
  )
)
