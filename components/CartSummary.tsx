import type { Product } from "@/lib/types";
import { formatPrice } from "@/lib/format";
import Card from "./Card";

export interface CartSummaryProps {
  /** Items currently in the cart (one entry per Add to Cart action). */
  cart: Product[];
}

/**
 * Displays the number of items in the cart and the running total.
 * Pure presentational component derived from the cart array.
 */
export default function CartSummary({ cart }: CartSummaryProps) {
  const itemCount = cart.length;
  const total = cart.reduce((sum, product) => sum + product.price, 0);

  return (
    <Card className="p-5">
      <h3 className="text-base font-semibold text-zinc-900">Cart summary</h3>
      <dl className="mt-3 space-y-2 text-sm">
        <div className="flex justify-between">
          <dt className="text-zinc-500">Items</dt>
          <dd className="font-medium text-zinc-900">{itemCount}</dd>
        </div>
        <div className="flex justify-between border-t border-zinc-100 pt-2">
          <dt className="text-zinc-500">Total</dt>
          <dd className="font-bold text-zinc-900">{formatPrice(total)}</dd>
        </div>
      </dl>
      {itemCount === 0 && (
        <p className="mt-3 text-xs text-zinc-400">
          Your cart is empty. Add a product to get started.
        </p>
      )}
    </Card>
  );
}
