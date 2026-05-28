/**
 * Shared cart types. Split out of `cart.tsx` so `shopify.ts` can reference
 * the launch-site product IDs without dragging in React or framer-motion.
 */

export type CartProductId = "his" | "hers" | "duo" | "starter" | "subscribe";

export interface CartProduct {
  id: CartProductId;
  name: string;
  /** Display price, e.g. "€49.95". */
  price: string;
  /** Numeric price in EUR for local subtotal math (Shopify is source of truth at checkout). */
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
