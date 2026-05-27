"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart";

/**
 * Compact pill that lives in the primary nav. Hidden when empty so the
 * surface stays focused on the "Shop now" CTA — appears with a soft pop
 * once the first item lands. Tapping it scrolls to the products section
 * (the placeholder cart has no /cart route).
 */
export function CartIndicator() {
  const { count, totalEur } = useCart();
  const totalLabel = `€${totalEur.toFixed(2).replace(".", ",")}`;
  return (
    <AnimatePresence>
      {count > 0 ? (
        <motion.a
          href="#products"
          initial={{ opacity: 0, scale: 0.85, y: -6 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.85, y: -6 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="hidden items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-3 py-1.5 text-[11px] font-bold tracking-[0.08em] text-white/80 uppercase backdrop-blur-md transition-colors hover:border-fuchsia-400/40 hover:text-white sm:inline-flex"
          aria-label={`Cart: ${count} item${count === 1 ? "" : "s"}, total ${totalLabel}`}
        >
          <ShoppingBag size={13} className="text-fuchsia-300" />
          <span>{count}</span>
          <span className="text-white/40">·</span>
          <span>{totalLabel}</span>
        </motion.a>
      ) : null}
    </AnimatePresence>
  );
}
