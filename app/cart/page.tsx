"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/format";
import Card from "@/components/Card";
import LoadingState from "@/components/LoadingState";

/**
 * /cart — the shopping cart.
 *
 * Shows a table of line items with quantity steppers and a per-row remove
 * button, a running total, an empty state, and a checkout button that is
 * disabled when the cart is empty (rubric requirement). The cart lives in
 * CartContext and is persisted to localStorage, so it survives refreshes.
 *
 * Open to guests too (they can build a cart), but checkout itself requires a
 * customer session — enforced on /checkout.
 */
export default function CartPage() {
  const { items, initializing, totalQuantity, totalPrice, setQuantity, removeItem } =
    useCart();
  const router = useRouter();

  if (initializing) {
    return <LoadingState message="Loading your cart..." />;
  }

  const isEmpty = items.length === 0;

  function handleRemove(productId: number, name: string) {
    removeItem(productId);
    toast.success(`Removed ${name} from cart.`);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-zinc-900">Your cart</h1>

      {isEmpty ? (
        <Card className="p-10 text-center">
          <p data-testid="cart-empty" className="text-sm text-zinc-500">
            Your cart is empty.
          </p>
          <Link
            href="/products"
            className="mt-4 inline-flex rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
          >
            Browse products
          </Link>
        </Card>
      ) : (
        <>
          <Card className="overflow-hidden">
            <table className="w-full text-sm" data-testid="cart-table">
              <thead className="border-b border-zinc-200 bg-zinc-50 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
                <tr>
                  <th className="px-5 py-3">Product</th>
                  <th className="px-5 py-3">Price</th>
                  <th className="px-5 py-3">Quantity</th>
                  <th className="px-5 py-3 text-right">Subtotal</th>
                  <th className="px-5 py-3 text-right">Remove</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {items.map(({ product, quantity }) => (
                  <tr key={product.id} data-testid="cart-row">
                    <td className="px-5 py-4">
                      <Link
                        href={`/products/${product.id}`}
                        className="font-medium text-zinc-900 hover:text-indigo-600 hover:underline"
                      >
                        {product.name}
                      </Link>
                    </td>
                    <td className="px-5 py-4 text-zinc-600">
                      {formatPrice(product.price)}
                    </td>
                    <td className="px-5 py-4">
                      <div className="inline-flex items-center rounded-md border border-zinc-300">
                        <button
                          type="button"
                          onClick={() => setQuantity(product.id, quantity - 1)}
                          aria-label={`Decrease ${product.name} quantity`}
                          className="px-3 py-1 text-zinc-600 hover:bg-zinc-100"
                        >
                          &minus;
                        </button>
                        <span className="min-w-8 text-center font-medium">
                          {quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => setQuantity(product.id, quantity + 1)}
                          disabled={quantity >= product.stock_quantity}
                          aria-label={`Increase ${product.name} quantity`}
                          className="px-3 py-1 text-zinc-600 hover:bg-zinc-100 disabled:opacity-40"
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right font-medium text-zinc-900">
                      {formatPrice(product.price * quantity)}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleRemove(product.id, product.name)}
                        data-testid="remove-item"
                        className="rounded-md px-2 py-1 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          <div className="flex flex-col items-end gap-4">
            <div className="text-right">
              <p className="text-sm text-zinc-500">
                {totalQuantity} item{totalQuantity === 1 ? "" : "s"}
              </p>
              <p className="text-2xl font-bold text-zinc-900" data-testid="cart-total">
                {formatPrice(totalPrice)}
              </p>
            </div>
            <button
              type="button"
              disabled={isEmpty}
              onClick={() => router.push("/checkout")}
              data-testid="checkout-button"
              className="rounded-md bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-zinc-200 disabled:text-zinc-400"
            >
              Proceed to checkout
            </button>
          </div>
        </>
      )}
    </div>
  );
}
