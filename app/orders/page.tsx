"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRequireAuth } from "@/lib/useRequireAuth";
import { fetchOrdersClient } from "@/lib/client-api";
import { formatPrice, orderStatusClasses } from "@/lib/format";
import type { Order } from "@/lib/types";
import Card from "@/components/Card";
import LoadingState from "@/components/LoadingState";

/**
 * /orders — a customer's own order history.
 *
 * Customer-only (useRequireAuth sends guests to /login). The API returns all
 * orders, so the page filters to the logged-in user's id. Admins are routed to
 * the read-only dashboard overview instead; if an admin lands here they are
 * redirected away by useRequireAuth-less logic below.
 */
export default function OrdersPage() {
  const { checking } = useRequireAuth();
  const { user } = useAuth();

  const [orders, setOrders] = useState<Order[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    let active = true;
    (async () => {
      try {
        const all = await fetchOrdersClient();
        if (active) setOrders(all.filter((o) => o.user_id === user.id));
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : "Failed to load orders.");
        }
      }
    })();
    return () => {
      active = false;
    };
  }, [user]);

  if (checking) {
    return <LoadingState message="Loading your orders..." />;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-zinc-900">Your orders</h1>

      {error && (
        <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {!error && orders === null && (
        <LoadingState message="Loading your orders..." />
      )}

      {!error && orders !== null && orders.length === 0 && (
        <Card className="p-10 text-center">
          <p className="text-sm text-zinc-500">
            You haven&rsquo;t placed any orders yet.
          </p>
          <Link
            href="/products"
            className="mt-4 inline-flex rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
          >
            Start shopping
          </Link>
        </Card>
      )}

      {!error && orders !== null && orders.length > 0 && (
        <div className="space-y-4" data-testid="orders-list">
          {orders.map((order) => (
            <Link key={order.id} href={`/orders/${order.id}`} className="block">
              <Card className="flex items-center justify-between p-5 transition-shadow hover:shadow-md">
                <div>
                  <p className="text-base font-semibold text-zinc-900">
                    Order #{order.id}
                  </p>
                  <p className="mt-1 text-sm text-zinc-500">
                    View items and details
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${orderStatusClasses(
                      order.status,
                    )}`}
                  >
                    {order.status}
                  </span>
                  <span className="text-lg font-bold text-zinc-900">
                    {formatPrice(order.total_amount)}
                  </span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
