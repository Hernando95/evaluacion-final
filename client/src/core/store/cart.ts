import { create } from 'zustand';
import { CartItem, Product } from '@/types';

interface CartState {
  items: CartItem[];
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  total: () => number;
}

export const useCart = create<CartState>((set, get) => ({
  items: [],
  
  addItem: (product: Product, quantity = 1) => {
    set((state) => {
      const existingItem = state.items.find(item => item.product.id === product.id);
      
      if (existingItem) {
        return {
          items: state.items.map(item =>
            item.product.id === product.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          ),
        };
      } else {
        return {
          items: [...state.items, { id: product.id, product, quantity }],
        };
      }
    });
  },
  
  removeItem: (id: string) => {
    set((state) => ({
      items: state.items.filter(item => item.product.id !== id),
    }));
  },
  
  updateQuantity: (id: string, quantity: number) => {
    if (quantity <= 0) {
      get().removeItem(id);
      return;
    }
    
    set((state) => ({
      items: state.items.map(item =>
        item.product.id === id ? { ...item, quantity } : item
      ),
    }));
  },
  
  clearCart: () => {
    set({ items: [] });
  },
  
  total: () => {
    return get().items.reduce((acc, item) => {
      const price = item.product.discounted_price || item.product.price;
      return acc + (price * item.quantity);
    }, 0);
  },
}));