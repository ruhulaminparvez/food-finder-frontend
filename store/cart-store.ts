import { create } from 'zustand';
import { Cart } from '@/types';

interface CartState {
  carts: Record<string, Cart | null>; // restaurantId -> Cart
  setCart: (restaurantId: string, cart: Cart | null) => void;
  clearCart: (restaurantId: string) => void;
  getCart: (restaurantId: string) => Cart | null;
  getTotalItems: (restaurantId: string) => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  carts: {},
  setCart: (restaurantId, cart) => {
    set((state) => ({
      carts: {
        ...state.carts,
        [restaurantId]: cart,
      },
    }));
  },
  clearCart: (restaurantId) => {
    set((state) => {
      const newCarts = { ...state.carts };
      delete newCarts[restaurantId];
      return { carts: newCarts };
    });
  },
  getCart: (restaurantId) => {
    return get().carts[restaurantId] || null;
  },
  getTotalItems: (restaurantId) => {
    const cart = get().carts[restaurantId];
    if (!cart) return 0;
    return cart.items.reduce((total, item) => total + item.quantity, 0);
  },
}));
