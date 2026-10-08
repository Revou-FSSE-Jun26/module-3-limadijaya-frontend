import { Suspense } from "react";
import { getOrders } from "@/lib/api";
import { formatPrice } from "@/lib/format";
import Card from "@/components/Card";

export const metadata = {
  title: "Orders",
  description: "View all RevoShop orders, fetched live from the API.",
};

/** Tailwind badge classes per order status. */
function statusClasses(status: string): string {
  const map: Record<string, string> = {
    pending: "bg-amber-100 text-amber-700",
    confirmed: "bg-blue-100 text-blue-700",
    shipped: "bg-indigo-100 text-indigo-700",
    delivered: "bg-green-100 text-green-700",
    completed: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
  };
  return map[status] ?? "bg-zinc-100 text-zinc-700";
}

/**
 * Orders page. The live GET /orders fetch streams behind <Suspense>.
 */
export default function OrdersPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-zinc-900">Orders</h1>
      <Suspense fallback={<OrdersSkeleton />}>
        <OrderList />
      </Suspense>
    </div>
  );
}

/** Inner Server Component that fetches GET /orders with async/await. */
async function OrderList() {
  const orders = await getOrders();

  if (orders.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-zinc-500">No orders yet.</p>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <Card key={order.id} className="flex items-center justify-between p-5">
          <div>
            <p className="text-base font-semibold text-zinc-900">
              Order #{order.id}
            </p>
            <p className="mt-1 text-sm text-zinc-500">
              Placed by user #{order.user_id}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <span
              className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${statusClasses(
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
      ))}
    </div>
  );
}

function OrdersSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="h-20 animate-pulse rounded-xl border border-zinc-200 bg-zinc-100"
        />
      ))}
    </div>
  );
}
