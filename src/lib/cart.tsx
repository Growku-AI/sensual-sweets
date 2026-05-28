"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  cartCreate,
  cartGet,
  cartLinesAdd,
  cartLinesRemove,
  isShopifyConfigured,
  resolveMerchandise,
  type ResolvedMerchandise,
  type ShopifyCart,
  type ShopifyCartLine,
} from "./shopify";
import {
  type CartLine,
  type CartProduct,
  type CartProductId,
  PRODUCTS,
} from "./cart-types";

export type { CartLine, CartProduct, CartProductId };
export { PRODUCTS };

/**
 * Sensual Sweets — cart context.
 *
 * Backed by Shopify Storefront API when `NEXT_PUBLIC_SHOPIFY_*` env vars are
 * present; otherwise falls back to a localStorage-only display cart so the
 * marketing site still renders correctly during dev or before products are
 * published to the Headless channel. Public API matches the original
 * placeholder cart so component consumers (AddToCartButton, CartToast,
 * CartIndicator) keep working unchanged.
 */

interface CartState {
  lines: CartLine[];
  count: number;
  totalEur: number;
  lastAdded: CartProductId | null;
  /** Shopify-hosted checkout URL; `null` until the cart has a line. */
  checkoutUrl: string | null;
  /** True while a Storefront API mutation is in flight. */
  isBusy: boolean;
  /** True when the cart is fully wired to Shopify (catalog resolved). */
  isShopifyLive: boolean;
  add: (id: CartProductId, qty?: number) => void;
  remove: (id: CartProductId) => void;
  clear: () => void;
  /** Navigate the browser to the Shopify-hosted checkout. No-op if empty. */
  checkout: () => void;
}

const CartContext = createContext<CartState | null>(null);

const CART_ID_KEY = "sensual-sweets:cart:v2:id";
const LEGACY_LINES_KEY = "sensual-sweets:cart:v1";

type Catalog = Map<CartProductId, ResolvedMerchandise>;

interface PersistedLine {
  id: CartProductId;
  quantity: number;
}

// ---------------------------------------------------------------------------
// localStorage helpers — used as a fallback when Shopify isn't configured,
// and to remember the active cartId across reloads when it is.
// ---------------------------------------------------------------------------

function readPersistedLines(): PersistedLine[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(LEGACY_LINES_KEY);
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

function writePersistedLines(lines: CartLine[]): void {
  if (typeof window === "undefined") return;
  try {
    const minimal: PersistedLine[] = lines.map((line) => ({
      id: line.product.id,
      quantity: line.quantity,
    }));
    window.localStorage.setItem(LEGACY_LINES_KEY, JSON.stringify(minimal));
  } catch {
    /* ignore quota / serialization errors */
  }
}

function readCartId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(CART_ID_KEY);
  } catch {
    return null;
  }
}

function writeCartId(id: string | null): void {
  if (typeof window === "undefined") return;
  try {
    if (id) window.localStorage.setItem(CART_ID_KEY, id);
    else window.localStorage.removeItem(CART_ID_KEY);
  } catch {
    /* ignore */
  }
}

// ---------------------------------------------------------------------------
// Mapping Shopify cart lines back to launch-site products.
// ---------------------------------------------------------------------------

/**
 * Reverse-lookup a Shopify cart line to its launch-site product ID. Disambiguates
 * `duo` vs `subscribe` (same variant, different selling plan) by inspecting
 * `sellingPlanId`.
 */
function lineToProductId(
  line: ShopifyCartLine,
  catalog: Catalog,
): CartProductId | null {
  const subscribe = catalog.get("subscribe");
  if (
    subscribe &&
    subscribe.variantId === line.merchandiseId &&
    line.sellingPlanId &&
    line.sellingPlanId === subscribe.sellingPlanId
  ) {
    return "subscribe";
  }
  for (const [id, merch] of catalog) {
    if (id === "subscribe") continue;
    if (merch.variantId === line.merchandiseId && !line.sellingPlanId) {
      return id;
    }
  }
  return null;
}

function shopifyCartToLines(cart: ShopifyCart, catalog: Catalog): CartLine[] {
  const merged = new Map<CartProductId, CartLine>();
  for (const line of cart.lines) {
    const id = lineToProductId(line, catalog);
    if (!id) continue;
    const product = PRODUCTS[id];
    const existing = merged.get(id);
    if (existing) {
      existing.quantity += line.quantity;
    } else {
      merged.set(id, { product, quantity: line.quantity });
    }
  }
  return Array.from(merged.values());
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function CartProvider({ children }: { children: React.ReactNode }) {
  const shopifyEnabled = isShopifyConfigured();

  // Shared visible state — populated either from Shopify or from localStorage.
  const [lines, setLines] = useState<CartLine[]>([]);
  const [lastAdded, setLastAdded] = useState<CartProductId | null>(null);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  // Shopify-only — null until catalog has been resolved.
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const cartIdRef = useRef<string | null>(null);
  // Serialize mutations so rapid clicks don't race.
  const mutationQueue = useRef<Promise<unknown>>(Promise.resolve());

  // ---- Hydrate on mount ------------------------------------------------

  useEffect(() => {
    if (!shopifyEnabled) {
      // Legacy display-only behaviour. Hydrating from localStorage after mount
      // is intentional here — server can't read window.localStorage, so the
      // initial render must be empty and reconcile on the client.
      const persisted = readPersistedLines();
      if (persisted.length > 0) {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage hydration
        setLines(
          persisted.map((p) => ({
            product: PRODUCTS[p.id],
            quantity: p.quantity,
          })),
        );
      }
      return;
    }

    let cancelled = false;

    void (async () => {
      // Resolve catalog (all 5 SKUs) in parallel. Missing products are skipped
      // — the cart stays in display-only mode until they're published.
      try {
        const ids = Object.keys(PRODUCTS) as CartProductId[];
        const resolved = await Promise.all(
          ids.map(async (id) => {
            try {
              const merch = await resolveMerchandise(id);
              return [id, merch] as const;
            } catch {
              return [id, null] as const;
            }
          }),
        );
        if (cancelled) return;
        const map: Catalog = new Map();
        for (const [id, merch] of resolved) {
          if (merch) map.set(id, merch);
        }
        setCatalog(map);

        // Resume existing cart if one is stored.
        const storedCartId = readCartId();
        if (storedCartId) {
          try {
            const cart = await cartGet(storedCartId);
            if (cancelled) return;
            if (cart && cart.totalQuantity > 0) {
              cartIdRef.current = cart.id;
              setLines(shopifyCartToLines(cart, map));
              setCheckoutUrl(cart.checkoutUrl);
            } else {
              writeCartId(null);
            }
          } catch {
            // Stale cartId or network blip — silently reset, cart will be
            // recreated on next add().
            writeCartId(null);
          }
        }
      } catch {
        // Catalog resolution failed entirely. Cart falls back to display-only
        // localStorage behavior; add() will warn in the console.
        const persisted = readPersistedLines();
        if (persisted.length > 0 && !cancelled) {
          setLines(
            persisted.map((p) => ({
              product: PRODUCTS[p.id],
              quantity: p.quantity,
            })),
          );
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [shopifyEnabled]);

  // Mirror display-only cart to localStorage when Shopify is off.
  useEffect(() => {
    if (shopifyEnabled) return;
    writePersistedLines(lines);
  }, [lines, shopifyEnabled]);

  // ---- Mutations -------------------------------------------------------

  /** Serialize a Shopify mutation behind the queue + busy flag. */
  const enqueue = useCallback(<T,>(fn: () => Promise<T>): Promise<T> => {
    const next = mutationQueue.current
      .catch(() => {
        /* swallow prior errors */
      })
      .then(async () => {
        setIsBusy(true);
        try {
          return await fn();
        } finally {
          setIsBusy(false);
        }
      });
    mutationQueue.current = next.catch(() => {
      /* swallow so chain stays alive */
    });
    return next;
  }, []);

  const addLocal = useCallback((id: CartProductId, qty: number) => {
    setLines((prev) => {
      const product = PRODUCTS[id];
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

  const removeLocal = useCallback((id: CartProductId) => {
    setLines((prev) => prev.filter((line) => line.product.id !== id));
  }, []);

  const add = useCallback(
    (id: CartProductId, qty = 1) => {
      // Display-only path: just update local state.
      if (!shopifyEnabled || !catalog) {
        addLocal(id, qty);
        return;
      }
      const merch = catalog.get(id);
      if (!merch) {
        // Product not yet published to the Headless channel — degrade
        // gracefully so the toast still pops.
        console.warn(
          `[cart] product "${id}" not available on Shopify yet; using display-only state`,
        );
        addLocal(id, qty);
        return;
      }

      // Optimistic local update so the toast and indicator feel instant.
      addLocal(id, qty);

      void enqueue(async () => {
        try {
          let cart: ShopifyCart;
          if (cartIdRef.current) {
            cart = await cartLinesAdd(cartIdRef.current, {
              merchandiseId: merch.variantId,
              quantity: qty,
              sellingPlanId: merch.sellingPlanId,
            });
          } else {
            cart = await cartCreate({
              merchandiseId: merch.variantId,
              quantity: qty,
              sellingPlanId: merch.sellingPlanId,
            });
            cartIdRef.current = cart.id;
            writeCartId(cart.id);
          }
          // Reconcile from server (authoritative).
          setLines(shopifyCartToLines(cart, catalog));
          setCheckoutUrl(cart.checkoutUrl);
        } catch (err) {
          console.error("[cart] failed to sync add to Shopify", err);
        }
      });
    },
    [shopifyEnabled, catalog, addLocal, enqueue],
  );

  const remove = useCallback(
    (id: CartProductId) => {
      if (!shopifyEnabled || !catalog || !cartIdRef.current) {
        removeLocal(id);
        return;
      }
      const merch = catalog.get(id);
      if (!merch) {
        removeLocal(id);
        return;
      }
      // Optimistic local update.
      removeLocal(id);

      void enqueue(async () => {
        try {
          // Find the matching Shopify line(s) for this product. Subscribe vs
          // duo share a variant but differ on sellingPlanId.
          if (!cartIdRef.current) return;
          const current = await cartGet(cartIdRef.current);
          if (!current) return;
          const matchingLineIds = current.lines
            .filter((line) => {
              if (id === "subscribe") {
                return (
                  line.merchandiseId === merch.variantId &&
                  line.sellingPlanId === merch.sellingPlanId
                );
              }
              return (
                line.merchandiseId === merch.variantId && !line.sellingPlanId
              );
            })
            .map((line) => line.id);
          if (matchingLineIds.length === 0) return;
          const cart = await cartLinesRemove(
            cartIdRef.current,
            matchingLineIds,
          );
          setLines(shopifyCartToLines(cart, catalog));
          setCheckoutUrl(cart.checkoutUrl);
          if (cart.totalQuantity === 0) {
            // Empty cart — Shopify keeps it alive but UX is cleaner if we
            // start fresh next time.
            cartIdRef.current = null;
            writeCartId(null);
            setCheckoutUrl(null);
          }
        } catch (err) {
          console.error("[cart] failed to sync remove to Shopify", err);
        }
      });
    },
    [shopifyEnabled, catalog, removeLocal, enqueue],
  );

  const clear = useCallback(() => {
    setLines([]);
    setCheckoutUrl(null);
    if (shopifyEnabled) {
      cartIdRef.current = null;
      writeCartId(null);
    }
  }, [shopifyEnabled]);

  const checkout = useCallback(() => {
    if (!checkoutUrl) return;
    if (typeof window !== "undefined") {
      window.location.href = checkoutUrl;
    }
  }, [checkoutUrl]);

  // ---- Derived ---------------------------------------------------------

  const value = useMemo<CartState>(() => {
    const count = lines.reduce((sum, line) => sum + line.quantity, 0);
    const totalEur = lines.reduce(
      (sum, line) => sum + line.product.priceEur * line.quantity,
      0,
    );
    return {
      lines,
      count,
      totalEur,
      lastAdded,
      checkoutUrl,
      isBusy,
      isShopifyLive: shopifyEnabled && catalog !== null,
      add,
      remove,
      clear,
      checkout,
    };
  }, [
    lines,
    lastAdded,
    checkoutUrl,
    isBusy,
    shopifyEnabled,
    catalog,
    add,
    remove,
    clear,
    checkout,
  ]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartState {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within a <CartProvider>");
  }
  return ctx;
}
