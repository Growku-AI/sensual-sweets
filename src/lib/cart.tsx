"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

/**
 * Sensual Sweets — placeholder cart.
 *
 * This is a non-Shopify cart used purely for the launch-marketing build.
 * State persists in localStorage so the badge survives reloads, but there
 * is intentionally no checkout / no inventory / no Shopify call. When the
 * real storefront is wired in, swap the implementation of `useCart` for a
 * real Shopify client and keep the component API identical.
 */

export type CartProductId = "his" | "hers" | "duo" | "starter" | "subscribe";

export interface CartProduct {
  id: CartProductId;
  name: string;
  /** Display price, e.g. "€49.95". */
  price: string;
  /** Numeric price in EUR for total math. */
  priceEur: number;
  accent: "blue" | "rose" | "duo";
}

export const PRODUCTS: Record<CartProductId, CartProduct> = {
  his: {
    id: "his",
    name: "HIS — Drive & Endurance",
    price: "€49.95",
    priceEur: 49.95,
    accent: "blue",
  },
  hers: {
    id: "hers",
    name: "HERS — Sensation & Mood",
    price: "€49.95",
    priceEur: 49.95,
    accent: "rose",
  },
  duo: {
    id: "duo",
    name: "DUO Bundle — His + Hers",
    price: "€89.95",
    priceEur: 89.95,
    accent: "duo",
  },
  starter: {
    id: "starter",
    name: "Starter Set — Trial pack",
    price: "€24.95",
    priceEur: 24.95,
    accent: "duo",
  },
  subscribe: {
    id: "subscribe",
    name: "Subscribe — Monthly DUO",
    price: "€71.95",
    priceEur: 71.95,
    accent: "duo",
  },
};

export interface CartLine {
  product: CartProduct;
  quantity: number;
}

interface CartState {
  lines: CartLine[];
  count: number;
  totalEur: number;
  lastAdded: CartProductId | null;
  add: (id: CartProductId, qty?: number) => void;
  remove: (id: CartProductId) => void;
  clear: () => void;
}

const CartContext = createContext<CartState | null>(null);

const STORAGE_KEY = "sensual-sweets:cart:v1";

interface PersistedLine {
  id: CartProductId;
  quantity: number;
}

function readPersisted(): PersistedLine[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (entry): entry is PersistedLine =>
        !!entry &&
        typeof entry === "object" &&
        "id" in entry &&
        "quantity" in entry &&
        typeof (entry as PersistedLine).quantity === "number" &&
        (entry as PersistedLine).id in PRODUCTS,
    );
  } catch {
    return [];
  }
}

function writePersisted(lines: CartLine[]): void {
  if (typeof window === "undefined") return;
  try {
    const minimal: PersistedLine[] = lines.map((line) => ({
      id: line.product.id,
      quantity: line.quantity,
    }));
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(minimal));
  } catch {
    /* ignore quota / serialization errors */
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [lastAdded, setLastAdded] = useState<CartProductId | null>(null);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage after mount to avoid SSR mismatch.
  useEffect(() => {
    const persisted = readPersisted();
    if (persisted.length > 0) {
      setLines(
        persisted.map((p) => ({ product: PRODUCTS[p.id], quantity: p.quantity })),
      );
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) writePersisted(lines);
  }, [lines, hydrated]);

  const add = useCallback((id: CartProductId, qty = 1) => {
    setLines((prev) => {
      const product = PRODUCTS[id];
      if (!product) return prev;
      const existing = prev.find((line) => line.product.id === id);
      if (existing) {
        return prev.map((line) =>
          line.product.id === id
            ? { ...line, quantity: line.quantity + qty }
            : line,
        );
      }
      return [...prev, { product, quantity: qty }];
    });
    setLastAdded(id);
  }, []);

  const remove = useCallback((id: CartProductId) => {
    setLines((prev) => prev.filter((line) => line.product.id !== id));
  }, []);

  const clear = useCallback(() => {
    setLines([]);
  }, []);

  const value = useMemo<CartState>(() => {
    const count = lines.reduce((sum, line) => sum + line.quantity, 0);
    const totalEur = lines.reduce(
      (sum, line) => sum + line.product.priceEur * line.quantity,
      0,
    );
    return { lines, count, totalEur, lastAdded, add, remove, clear };
  }, [lines, lastAdded, add, remove, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartState {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within a <CartProvider>");
  }
  return ctx;
}
