"use client";

import { useState } from "react";
import Link from "next/link";
import type { Product } from "@/lib/types";
import { formatPrice, getButtonClasses } from "@/lib/format";
import { useAuth } from "@/context/AuthContext";
import Card from "./Card";

export interface ProductCardProps {
  /** The product to display. */
  product: Product;
  /**
   * Optional callback fired when "Add to Cart" is clicked, receiving the
   * product and the chosen quantity. When omitted, the card is read-only.
   */
  onAddToCart?: (product: Product, quantity: number) => void;
  /** Whether to show the interactive quantity counter. Defaults to true. */
  showQuantity?: boolean;
  /** Whether the card title links to the product detail page. Defaults to true. */
  linkToDetail?: boolean;
}

/**
 * Reusable product card.
 *
 * Demonstrates:
 *  - a typed ProductCardProps interface
 *  - optional props with destructuring defaults (showQuantity, linkToDetail)
 *  - a quantity counter held in local state
 *  - conditional rendering for stock state (badge, low-stock note, disabled button)
 *  - getButtonClasses(inStock) for available vs unavailable button styling
 */
export default function ProductCard({
  product,
  onAddToCart,
  showQuantity = true,
  linkToDetail = true,
}: ProductCardProps) {
  const [quantity, setQuantity] = useState(1);
  const { isAuthenticated } = useAuth();

  const inStock = product.stock_quantity > 0;
  const lowStock = inStock && product.stock_quantity <= 10;
  // Read-only when no handler is provided (e.g. the home page server render).
  const interactive = Boolean(onAddToCart);
  // Non-logged-in users don't get a buy action — they see a "Login to buy"
  // link instead of the Add to Cart button.
  const showLoginToBuy = interactive && !isAuthenticated;

  const decrement = () => setQuantity((q) => Math.max(1, q - 1));
  const increment = () =>
    setQuantity((q) => Math.min(product.stock_quantity, q + 1));

  return (
    <Card className="flex h-full flex-col p-5">
      {/* Title + stock badge */}
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-base font-semibold text-zinc-900">
          {linkToDetail ? (
            <Link
              href={`/products/${product.id}`}
              className="hover:text-indigo-600 hover:underline"
            >
              {product.name}
            </Link>
          ) : (
            product.name
          )}
        </h3>

        {/* Conditional rendering: in-stock vs out-of-stock badge */}
        {inStock ? (
          <span className="shrink-0 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
            In stock
          </span>
        ) : (
          <span className="shrink-0 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
            Out of stock
          </span>
        )}
      </div>

      {/* Conditional rendering: only show a description when present */}
      {product.description && (
        <p className="mt-2 line-clamp-2 text-sm text-zinc-500">
          {product.description}
        </p>
      )}

      <p className="mt-3 text-lg font-bold text-zinc-900">
        {formatPrice(product.price)}
      </p>

      {/* Conditional rendering: low-stock warning */}
      {lowStock && (
        <p className="mt-1 text-xs font-medium text-amber-600">
          Only {product.stock_quantity} left!
        </p>
      )}

      <div className="mt-auto pt-4">
        {/* Quantity counter — shown only for logged-in shoppers on an
            interactive, in-stock card. */}
        {showQuantity && interactive && !showLoginToBuy && inStock && (
          <div className="mb-3 flex items-center gap-3">
            <span className="text-sm text-zinc-600">Qty</span>
            <div className="flex items-center rounded-md border border-zinc-300">
              <button
                type="button"
                onClick={decrement}
                disabled={quantity <= 1}
                aria-label="Decrease quantity"
                className="px-3 py-1 text-zinc-600 hover:bg-zinc-100 disabled:opacity-40"
              >
                &minus;
              </button>
              <span className="min-w-8 text-center text-sm font-medium">
                {quantity}
              </span>
              <button
                type="button"
                onClick={increment}
                disabled={quantity >= product.stock_quantity}
                aria-label="Increase quantity"
                className="px-3 py-1 text-zinc-600 hover:bg-zinc-100 disabled:opacity-40"
              >
                +
              </button>
            </div>
          </div>
        )}

        {/* Guests see a "Login to buy" link instead of the Add to Cart
            button; logged-in shoppers get the real button. */}
        {showLoginToBuy ? (
          <Link
            href="/login"
            data-testid="login-to-buy"
            className={`w-full ${getButtonClasses(true)}`}
          >
            Login to buy
          </Link>
        ) : (
          interactive && (
            <button
              type="button"
              disabled={!inStock}
              onClick={() => onAddToCart?.(product, quantity)}
              className={`w-full ${getButtonClasses(inStock)}`}
            >
              {inStock ? "Add to Cart" : "Unavailable"}
            </button>
          )
        )}
      </div>
    </Card>
  );
}
