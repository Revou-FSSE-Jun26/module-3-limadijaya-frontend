"use client";

import { useEffect, useState } from "react";
import { fetchOrdersClient } from "@/lib/client-api";
import { formatPrice, orderStatusClasses } from "@/lib/format";
import type { Order } from "@/lib/types";
import Card from "@/components/Card";
import LoadingState from "@/components/LoadingState";

/**
 * /dashboard/orders — read-only overview of every order across all users.
 *
 * No mutation controls: admins review orders here but do not edit them in this
 * checkpoint. Access is guarded by the dashboard layout (adminOnly).
 */
export default function DashboardOrdersPage() {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await fetchOrdersClient();
        if (active) setOrders(data);
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : "Failed to load orders.");
        }
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  if (orders === null && !error) {
    return <LoadingState message="Loading orders..." />;
  }

  const revenue = (orders ?? []).reduce((sum, o) => sum + o.total_amount, 0);

  return (
    <div className="space-y-4">
      {error && (
        <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {!error && (
        <>
          <div className="flex flex-wrap gap-4">
            <Card className="flex-1 p-5">
              <p className="text-sm text-zinc-500">Total orders</p>
              <p className="mt-1 text-2xl font-bold text-zinc-900">
                {(orders ?? []).length}
              </p>
            </Card>
            <Card className="flex-1 p-5">
              <p className="text-sm text-zinc-500">Total revenue</p>
              <p className="mt-1 text-2xl font-bold text-zinc-900">
                {formatPrice(revenue)}
              </p>
            </Card>
          </div>

          <Card className="overflow-hidden">
            <table className="w-full text-sm" data-testid="orders-overview">
              <thead className="border-b border-zinc-200 bg-zinc-50 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
                <tr>
                  <th className="px-4 py-3">Order</th>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {(orders ?? []).length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-10 text-center text-zinc-500">
                      No orders yet.
                    </td>
                  </tr>
                ) : (
                  (orders ?? []).map((order) => (
                    <tr key={order.id}>
                      <td className="px-4 py-3 font-medium text-zinc-900">
                        #{order.id}
                      </td>
                      <td className="px-4 py-3 text-zinc-600">
                        User #{order.user_id}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${orderStatusClasses(
                            order.status,
                          )}`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-zinc-900">
                        {formatPrice(order.total_amount)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </Card>
        </>
      )}
    </div>
  );
}
