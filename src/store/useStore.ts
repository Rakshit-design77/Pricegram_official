import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Category, Platform } from '@/types'

interface AppState {
  searchTerm: string
  setSearchTerm: (term: string) => void
  location: string
  setLocation: (loc: string) => void
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
      location: '201310',
      setLocation: (loc) => set({ location: loc }),
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
    }
  )
)
