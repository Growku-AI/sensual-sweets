"use client";

import { ShoppingBag } from "lucide-react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { type CartProductId, useCart } from "@/lib/cart";

interface AddToCartButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onClick"> {
  productId: CartProductId;
  children: ReactNode;
  /** Whether to render the shopping bag icon (defaults to true). */
  withIcon?: boolean;
  /** Override the icon size. */
  iconSize?: number;
}

/**
 * Drop-in replacement for the static "Shop X" anchors used across the
 * marketing surface. Adds the product to the placeholder cart, lets the
 * toast subscriber show feedback, and keeps the visual API of a button.
 */
export function AddToCartButton({
  productId,
  children,
  withIcon = true,
  iconSize = 16,
  className,
  type = "button",
  ...rest
}: AddToCartButtonProps) {
  const { add } = useCart();
  return (
    <button
      {...rest}
      type={type}
      onClick={() => add(productId)}
      className={className}
      aria-label={
        rest["aria-label"] ??
        (typeof children === "string" ? `Add ${children} to cart` : undefined)
      }
    >
      {withIcon ? <ShoppingBag size={iconSize} /> : null}
      <span>{children}</span>
    </button>
  );
}
