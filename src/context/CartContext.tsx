import React, { createContext, useContext, useState, ReactNode } from 'react';

/* ================= TYPES ================= */

export interface CartItem {
  id: number;
  basketId: number;
  quantity: number;
  investmentType: 'SIP' | 'Lumpsum';
  amount: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: number) => void;
  clearCart: () => void;
  refreshCart: () => void;
}

/* ================= CONTEXT ================= */

export const CartContext = createContext<CartContextType | undefined>(undefined);

/* ================= PROVIDER ================= */

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = (item: CartItem) => {
    setItems(prev => [...prev, item]);
  };

  const removeItem = (id: number) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const clearCart = () => {
    setItems([]);
  };

  const refreshCart = () => {
    // placeholder: refresh from backend if implemented
    // keep as no-op to satisfy callers that expect the function
    setItems(prev => [...prev]);
  };

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, clearCart, refreshCart }}>
      {children}
    </CartContext.Provider>
  );
};

/* ================= HOOK ================= */

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default useCart;
