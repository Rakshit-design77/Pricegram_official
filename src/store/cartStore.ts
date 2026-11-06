import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '@/types';

export interface CartItem extends Product {
  cartItemId: string; // Unique ID for the cart instance
}

interface CartState {
  items: CartItem[];
  isCartOpen: boolean;
  addItem: (product: Product) => void;
  removeItem: (cartItemId: string) => void;
  clearCart: () => void;
  setIsCartOpen: (isOpen: boolean) => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      isCartOpen: false,
      
      addItem: (product) => set((state) => {
        // Prevent adding more than 10 items to keep AI prompt reasonable
        if (state.items.length >= 10) return state;
        
        return {
          items: [...state.items, { ...product, cartItemId: crypto.randomUUID() }],
          isCartOpen: true // Auto open cart on add
        };
      }),
      
      removeItem: (cartItemId) => set((state) => ({
        items: state.items.filter(item => item.cartItemId !== cartItemId)
      })),
      
      clearCart: () => set({ items: [] }),
      
      setIsCartOpen: (isOpen) => set({ isCartOpen: isOpen })
    }),
    {
      name: 'pricegram-smart-cart',
      partialize: (state) => ({ items: state.items }), // Only persist items, not UI state
    }
  )
);
