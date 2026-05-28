"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Check, ShoppingBag, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { PRODUCTS, useCart } from "@/lib/cart";

/**
 * Glass toast that pops in when an item is added. Auto-dismisses after a
 * few seconds, but the user can also flick it away. Stays anchored to the
 * bottom-right so it never fights the hero CTA on mobile.
 *
 * When Shopify is wired and the cart has a `checkoutUrl`, the toast adds a
 * "Checkout" CTA next to the dismiss button so the user can jump straight
 * to the Shopify-hosted checkout without hunting for the cart elsewhere.
 */
export function CartToast() {
  const { lastAdded, count, totalEur, checkoutUrl, isBusy, checkout } =
    useCart();
  const [visible, setVisible] = useState(false);
  const [bumpKey, setBumpKey] = useState(0);
  const lastSeen = useRef<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!lastAdded) return;
    // Use a fresh key each tick so re-clicks reset the timer & animation.
    const key = `${lastAdded}:${count}`;
    if (key === lastSeen.current) return;
    lastSeen.current = key;
    setBumpKey((k) => k + 1);
    setVisible(true);
    if (timer.current) clearTimeout(timer.current);
    // Slightly longer dwell when checkout is available so the CTA is reachable.
    timer.current = setTimeout(() => setVisible(false), checkoutUrl ? 5200 : 3600);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [lastAdded, count, checkoutUrl]);

  const product = lastAdded ? PRODUCTS[lastAdded] : null;
  const totalLabel = `€${totalEur.toFixed(2).replace(".", ",")}`;

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex justify-center px-4 sm:bottom-6 sm:right-6 sm:left-auto sm:justify-end"
    >
      <AnimatePresence>
        {visible && product ? (
          <motion.div
            key={bumpKey}
            initial={{ opacity: 0, y: 28, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.97 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-2xl border border-white/12 bg-[#0e0018]/92 px-4 py-3 shadow-[0_22px_60px_-10px_rgba(192,38,211,0.55)] backdrop-blur-2xl"
            role="status"
          >
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-blue-500 via-fuchsia-500 to-rose-500 text-white shadow-[0_0_24px_rgba(192,38,211,0.6)]">
              <Check size={18} strokeWidth={2.5} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[11px] font-bold tracking-[0.18em] text-fuchsia-200 uppercase">
                Added to bag
              </p>
              <p className="truncate text-sm font-semibold text-white">
                {product.name}
              </p>
              <p className="mt-0.5 flex items-center gap-1 text-xs text-white/55">
                <ShoppingBag size={11} className="text-fuchsia-300" />
                <span>
                  {count} item{count === 1 ? "" : "s"} · {totalLabel}
                </span>
              </p>
            </div>
            {checkoutUrl ? (
              <button
                type="button"
                onClick={checkout}
                disabled={isBusy}
                className="inline-flex shrink-0 items-center gap-1 rounded-full bg-gradient-to-br from-fuchsia-500 to-rose-500 px-3 py-1.5 text-[11px] font-bold tracking-[0.08em] text-white uppercase shadow-[0_0_18px_rgba(244,114,182,0.45)] transition-transform hover:scale-105 disabled:opacity-60"
                aria-label="Go to checkout"
              >
                <span>Checkout</span>
                <ArrowRight size={12} strokeWidth={2.5} />
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => setVisible(false)}
              className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-white/10 text-white/55 transition-colors hover:border-white/30 hover:text-white"
              aria-label="Dismiss"
            >
              <X size={13} />
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
