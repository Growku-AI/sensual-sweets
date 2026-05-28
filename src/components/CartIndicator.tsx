"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart";

/**
 * Compact pill that lives in the primary nav. Hidden when empty so the
 * surface stays focused on the "Shop now" CTA — appears with a soft pop
 * once the first item lands.
 *
 * When Shopify is wired and the cart has a `checkoutUrl`, the pill becomes
 * a Checkout button. Otherwise it falls back to its original behaviour:
 * an anchor scroll to the products section.
 */
export function CartIndicator() {
  const { count, totalEur, checkoutUrl, isBusy, checkout } = useCart();
  const totalLabel = `€${totalEur.toFixed(2).replace(".", ",")}`;
  const ariaLabel = `Cart: ${count} item${count === 1 ? "" : "s"}, total ${totalLabel}`;

  const baseClasses =
    "hidden items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-bold tracking-[0.08em] uppercase backdrop-blur-md sm:inline-flex";
  const idleClasses =
    "border-white/15 bg-white/[0.06] text-white/80 transition-colors hover:border-fuchsia-400/40 hover:text-white";
  const liveClasses =
    "border-fuchsia-400/50 bg-gradient-to-br from-fuchsia-500/25 via-rose-500/15 to-blue-500/20 text-white shadow-[0_0_24px_rgba(244,114,182,0.32)] transition-transform hover:scale-[1.03]";

  return (
    <AnimatePresence>
      {count > 0 ? (
        checkoutUrl ? (
          <motion.button
            type="button"
            onClick={checkout}
            disabled={isBusy}
            initial={{ opacity: 0, scale: 0.85, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: -6 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className={`${baseClasses} ${liveClasses} disabled:opacity-70`}
            aria-label={`Checkout. ${ariaLabel}`}
          >
            <ShoppingBag size={13} className="text-fuchsia-200" />
            <span>{count}</span>
            <span className="text-white/40">·</span>
            <span>{totalLabel}</span>
            <span className="ml-1 inline-flex items-center gap-1 border-l border-white/20 pl-2">
              <span>Checkout</span>
              <ArrowRight size={11} strokeWidth={2.5} />
            </span>
          </motion.button>
        ) : (
          <motion.a
            href="#products"
            initial={{ opacity: 0, scale: 0.85, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: -6 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className={`${baseClasses} ${idleClasses}`}
            aria-label={ariaLabel}
          >
            <ShoppingBag size={13} className="text-fuchsia-300" />
            <span>{count}</span>
            <span className="text-white/40">·</span>
            <span>{totalLabel}</span>
          </motion.a>
        )
      ) : null}
    </AnimatePresence>
  );
}
