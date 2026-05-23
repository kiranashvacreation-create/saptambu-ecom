"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type CartItem = {
  productId: string;
  title: string;
  slug: string;
  price: number;
  image: string | null;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  count: number;
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const storageKey = "saptambu-cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const hydrate = () => {
      try {
        const stored = window.localStorage.getItem(storageKey);
        setItems(stored ? (JSON.parse(stored) as CartItem[]) : []);
      } catch {
        setItems([]);
      }
    };

    const id = window.setTimeout(hydrate, 0);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(items));
    } catch {
      return;
    }
  }, [items]);

  const addItem = useCallback((item: Omit<CartItem, "quantity">, quantity = 1) => {
    setItems((current) => {
      const existing = current.find((entry) => entry.productId === item.productId);
      if (existing) {
        return current.map((entry) =>
          entry.productId === item.productId
            ? { ...entry, quantity: Math.min(99, entry.quantity + quantity) }
            : entry,
        );
      }

      return [...current, { ...item, quantity: Math.max(1, quantity) }];
    });
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    setItems((current) =>
      current
        .map((entry) =>
          entry.productId === productId
            ? { ...entry, quantity: Math.max(1, Math.min(99, Math.floor(quantity || 1))) }
            : entry,
        )
        .filter((entry) => entry.quantity > 0),
    );
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((current) => current.filter((entry) => entry.productId !== productId));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo(
    () => ({
      items,
      count: items.reduce((sum, item) => sum + item.quantity, 0),
      addItem,
      updateQuantity,
      removeItem,
      clear,
    }),
    [addItem, clear, items, removeItem, updateQuantity],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside CartProvider.");
  return context;
}
