"use client";

import Link from "next/link";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { getButtonClasses } from "@/lib/format";
import type { Product } from "@/lib/types";

export interface AddToCartButtonProps {
  product: Product;
  /** Quantity to add (defaults to 1). */
  quantity?: number;
  /** Extra classes for layout (width, etc.). */
  className?: string;
}

/**
 * Adds a product to the cart.
 *
 * - Logged-out users are redirected to /login (only customers shop).
 * - Admins are blocked (they manage the catalog, they don't buy).
 * - Out-of-stock products render a disabled "Unavailable" button.
 * - On success, shows a toast and updates the cart badge via CartContext.
 */
export default function AddToCartButton({
  product,
  quantity = 1,
  className = "",
}: AddToCartButtonProps) {
  const { isAuthenticated, isAdmin } = useAuth();
  const { addItem } = useCart();

  const inStock = product.stock_quantity > 0;

  // Guests get a visible "Login to buy" link instead of the Add to Cart button.
  if (!isAuthenticated) {
    return (
      <Link
        href="/login"
        data-testid="login-to-buy"
        className={`${getButtonClasses(true)} ${className}`}
      >
        Login to buy
      </Link>
    );
  }

  function handleClick() {
    if (isAdmin) {
      toast.error("Admins manage the catalog and cannot place orders.");
      return;
    }
    addItem(product, quantity);
    toast.success(`Added ${product.name} to cart.`);
  }

  return (
    <button
      type="button"
      disabled={!inStock}
      onClick={handleClick}
      data-testid="add-to-cart"
      className={`${getButtonClasses(inStock)} ${className}`}
    >
      {inStock ? "Add to Cart" : "Unavailable"}
    </button>
  );
}
