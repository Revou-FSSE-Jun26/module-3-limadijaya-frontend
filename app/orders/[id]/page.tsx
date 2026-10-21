"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useRequireAuth } from "@/lib/useRequireAuth";
import { fetchOrderClient } from "@/lib/client-api";
import { formatPrice, orderStatusClasses } from "@/lib/format";
import type { Order } from "@/lib/types";
import Card from "@/components/Card";
import LoadingState from "@/components/LoadingState";

/**
 * /orders/[id] — detail for a single order, with its line items.
 *
 * Customer-only. Loads the order via the same-origin proxy (which includes
 * items). If the order does not belong to the logged-in user, access is
 * denied so a customer cannot read another user's order by guessing the id.
 */
export default function OrderDetailPage() {
  const { checking } = useRequireAuth();
  const { user } = useAuth();
  const params = useParams<{ id: string }>();
  const orderId = Number(params.id);

  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [forbidden, setForbidden] = useState(false);

  useEffect(() => {
    if (!user || Number.isNaN(orderId)) return;
    let active = true;
    (async () => {
      try {
        const data = await fetchOrderClient(orderId);
        if (!active) return;
        if (data.user_id !== user.id) {
          setForbidden(true);
          return;
        }
        setOrder(data);
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : "Failed to load order.");
        }
      }
    })();
    return () => {
      active = false;
    };
  }, [user, orderId]);

  if (checking) {
    return <LoadingState message="Loading order..." />;
  }

  return (
    <div className="space-y-6">
      <Link
        href="/orders"
        className="inline-flex text-sm font-medium text-indigo-600 hover:underline"
      >
        &larr; Back to your orders
      </Link>

      {forbidden && (
        <Card className="p-8 text-center">
          <p className="text-sm text-zinc-600">
            This order does not belong to your account.
          </p>
        </Card>
      )}

      {error && !forbidden && (
        <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {!error && !forbidden && order === null && (
        <LoadingState message="Loading order..." />
      )}

      {order && !forbidden && (
        <Card className="p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-zinc-900">
                Order #{order.id}
              </h1>
              {order.created_at && (
                <p className="mt-1 text-sm text-zinc-500">
                  Placed {new Date(order.created_at).toLocaleString()}
                </p>
              )}
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${orderStatusClasses(
                order.status,
              )}`}
            >
              {order.status}
            </span>
          </div>

          <div className="mt-6 overflow-hidden rounded-lg border border-zinc-200">
            <table className="w-full text-sm">
              <thead className="bg-zinc-50 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
                <tr>
                  <th className="px-4 py-2">Product</th>
                  <th className="px-4 py-2">Unit price</th>
                  <th className="px-4 py-2">Qty</th>
                  <th className="px-4 py-2 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {(order.items ?? []).map((item) => (
                  <tr key={item.product_id}>
                    <td className="px-4 py-3 text-zinc-800">
                      {item.product?.name ?? `Product #${item.product_id}`}
                    </td>
                    <td className="px-4 py-3 text-zinc-600">
                      {formatPrice(item.unit_price)}
                    </td>
                    <td className="px-4 py-3 text-zinc-600">{item.quantity}</td>
                    <td className="px-4 py-3 text-right font-medium text-zinc-900">
                      {formatPrice(item.unit_price * item.quantity)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex justify-end">
            <p className="text-lg font-bold text-zinc-900">
              Total: {formatPrice(order.total_amount)}
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
