"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { PublicSettings } from "@/lib/settings";

export type CartItem = {
  key: string;
  productId: number;
  slug: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  stock: number;
  size: string;
  color: string;
};

type AddInput = Omit<CartItem, "key" | "quantity"> & { quantity?: number };

type CartContextValue = {
  items: CartItem[];
  count: number;
  subtotal: number;
  ready: boolean;
  settings: PublicSettings;
  drawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
  addItem: (item: AddInput) => void;
  updateQuantity: (key: string, quantity: number) => void;
  removeItem: (key: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "gao-cart-v1";

export function makeKey(productId: number, size: string, color: string) {
  return `${productId}::${size}::${color}`;
}

export function CartProvider({ children, settings }: { children: React.ReactNode; settings: PublicSettings }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Load once on mount (localStorage is client-only).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate from storage once
      if (raw) setItems(JSON.parse(raw));
    } catch {
      /* ignore corrupt storage */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, ready]);

  const addItem = useCallback((input: AddInput) => {
    const key = makeKey(input.productId, input.size, input.color);
    const qty = Math.max(1, input.quantity ?? 1);
    setItems((prev) => {
      const existing = prev.find((i) => i.key === key);
      if (existing) {
        return prev.map((i) =>
          i.key === key ? { ...i, quantity: Math.min(i.quantity + qty, input.stock), stock: input.stock, price: input.price } : i,
        );
      }
      return [...prev, { ...input, key, quantity: Math.min(qty, input.stock) }];
    });
    setDrawerOpen(true);
  }, []);

  const updateQuantity = useCallback((key: string, quantity: number) => {
    setItems((prev) =>
      prev.map((i) => (i.key === key ? { ...i, quantity: Math.max(1, Math.min(quantity, i.stock)) } : i)),
    );
  }, []);

  const removeItem = useCallback((key: string) => setItems((prev) => prev.filter((i) => i.key !== key)), []);
  const clear = useCallback(() => setItems([]), []);

  const value = useMemo<CartContextValue>(() => {
    const count = items.reduce((s, i) => s + i.quantity, 0);
    const subtotal = items.reduce((s, i) => s + i.quantity * i.price, 0);
    return { items, count, subtotal, ready, settings, drawerOpen, setDrawerOpen, addItem, updateQuantity, removeItem, clear };
  }, [items, ready, settings, drawerOpen, addItem, updateQuantity, removeItem, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
