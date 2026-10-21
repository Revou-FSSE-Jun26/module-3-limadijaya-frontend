"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useRequireAuth } from "@/lib/useRequireAuth";
import { createOrderClient } from "@/lib/client-api";
import { formatPrice } from "@/lib/format";
import Card from "@/components/Card";
import LoadingState from "@/components/LoadingState";

/**
 * /checkout — confirm and place the order.
 *
 * Customer-only: logged-out users are sent to /login (useRequireAuth). The
 * page summarizes the cart and, on confirm, POSTs to /orders with the user id
 * and line items. On success it clears the cart and redirects to /orders.
 */
export default function CheckoutPage() {
  const { checking } = useRequireAuth();
  const { user } = useAuth();
  const { items, totalQuantity, totalPrice, clear } = useCart();
  const router = useRouter();
  const [placing, setPlacing] = useState(false);

  if (checking) {
    return <LoadingState message="Checking your session..." />;
  }

  // Empty cart → nothing to check out.
  if (items.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-zinc-900">Checkout</h1>
        <Card className="p-10 text-center">
          <p className="text-sm text-zinc-500">
            Your cart is empty, so there is nothing to check out.
          </p>
          <Link
            href="/products"
            className="mt-4 inline-flex rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
          >
            Browse products
          </Link>
        </Card>
      </div>
    );
  }

  async function handleConfirm() {
    if (!user) return;
    setPlacing(true);
    try {
      await createOrderClient({
        user_id: user.id,
        items: items.map((i) => ({
          product_id: i.product.id,
          quantity: i.quantity,
        })),
      });
      clear();
      toast.success("Order placed successfully!");
      router.push("/orders");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Checkout failed.");
      setPlacing(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-zinc-900">Checkout</h1>

      <Card className="overflow-hidden">
        <div className="border-b border-zinc-200 bg-zinc-50 px-5 py-3 text-sm font-semibold text-zinc-700">
          Order summary
        </div>
        <ul className="divide-y divide-zinc-100">
          {items.map(({ product, quantity }) => (
            <li
              key={product.id}
              className="flex items-center justify-between px-5 py-3 text-sm"
            >
              <span className="text-zinc-700">
                {product.name}{" "}
                <span className="text-zinc-400">× {quantity}</span>
              </span>
              <span className="font-medium text-zinc-900">
                {formatPrice(product.price * quantity)}
              </span>
            </li>
          ))}
        </ul>
        <div className="flex items-center justify-between border-t border-zinc-200 px-5 py-4">
          <span className="text-sm text-zinc-500">
            {totalQuantity} item{totalQuantity === 1 ? "" : "s"}
          </span>
          <span className="text-xl font-bold text-zinc-900">
            {formatPrice(totalPrice)}
          </span>
        </div>
      </Card>

      <div className="flex items-center justify-between">
        <Link
          href="/cart"
          className="text-sm font-medium text-indigo-600 hover:underline"
        >
          &larr; Back to cart
        </Link>
        <button
          type="button"
          onClick={handleConfirm}
          disabled={placing}
          data-testid="confirm-order"
          className="rounded-md bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {placing ? "Placing order..." : "Confirm order"}
        </button>
      </div>
    </div>
  );
}
