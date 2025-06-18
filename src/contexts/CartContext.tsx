'use client';

import React, { createContext, useContext, useReducer, ReactNode, useEffect, useMemo } from 'react';
import { db } from '@/lib/db';

export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  category: string;
  unit: string;
  isOrganic?: boolean;
  features?: string[];
}

export interface CartItem extends Product {
  quantity: number;
}

interface CartState {
  items: CartItem[];
  total: number;
}

type CartAction = 
  | { type: 'ADD_ITEM'; payload: { product: Product; quantity: number } }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' };

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const { product, quantity } = action.payload;
      const existingItem = state.items.find(item => item.id === product.id);

      let updatedItems: CartItem[];

      if (existingItem) {
        updatedItems = state.items.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        updatedItems = [...state.items, { ...product, quantity }];
      }

      return {
        items: updatedItems,
        total: updatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
      };
    }
    
    case 'REMOVE_ITEM':
      const filteredItems = state.items.filter(item => item.id !== action.payload);
      return {
        items: filteredItems,
        total: filteredItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      };
    
    case 'UPDATE_QUANTITY':
      const updatedItems = state.items.map(item =>
        item.id === action.payload.id
          ? { ...item, quantity: action.payload.quantity }
          : item
      ).filter(item => item.quantity > 0);
      return {
        items: updatedItems,
        total: updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      };
    
    case 'CLEAR_CART':
      return { items: [], total: 0 };
    
    default:
      return state;
  }
};

interface CartContextType {
  state: CartState;
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(cartReducer, { items: [], total: 0 }, () => {
    if (typeof window === 'undefined') {
      return { items: [], total: 0 };
    }
    try {
      const stored = localStorage.getItem('cartState');
      if (stored) {
        return JSON.parse(stored) as CartState;
      }
    } catch (err) {
      console.error('Failed to parse stored cart', err);
    }
    return { items: [], total: 0 };
  });

  // Persist & cross-tab sync
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cartState', JSON.stringify(state));
      // Persist to IndexedDB (Dexie)
      (async () => {
        try {
          await db.cartItems.clear();
          if (state.items.length) {
            await db.cartItems.bulkPut(state.items);
          }
        } catch (err) {
          console.error('Failed to persist cart to DB', err);
        }
      })();
    }
  }, [state]);

  // Listen for updates from other tabs / windows
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handler = (e: StorageEvent) => {
      if (e.key === 'cartState' && e.newValue) {
        try {
          const newState = JSON.parse(e.newValue) as CartState;
          dispatch({ type: 'CLEAR_CART' }); // reset first
          // re-apply items
          newState.items.forEach(item => {
            dispatch({ type: 'ADD_ITEM', payload: { product: item, quantity: item.quantity } });
          });
        } catch {}
      }
    };
    window.addEventListener('storage', handler);

    // On first mount, load persisted data from IndexedDB if available (this runs once)
    (async () => {
      try {
        const saved = await db.cartItems.toArray();
        if (saved.length) {
          // replace state with saved
          dispatch({ type: 'CLEAR_CART' });
          saved.forEach(item => {
            dispatch({ type: 'ADD_ITEM', payload: { product: item, quantity: item.quantity } });
          });
        }
      } catch (err) {
        console.error('Failed to load cart from DB', err);
      }
    })();

    return () => window.removeEventListener('storage', handler);
  }, []);

  const addItem = (product: Product, quantity: number = 1) => {
    dispatch({ type: 'ADD_ITEM', payload: { product, quantity } });
  };

  const removeItem = (id: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: id });
  };

  const updateQuantity = (id: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const contextValue = useMemo(() => ({
    state,
    addItem,
    removeItem,
    updateQuantity,
    clearCart
  }), [state, addItem, removeItem, updateQuantity, clearCart]);

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
