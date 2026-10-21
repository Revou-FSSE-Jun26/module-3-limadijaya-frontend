// Small presentation helpers shared across components.

/** Format a numeric amount as USD currency, e.g. 199.99 -> "$199.99". */
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

/** Tailwind badge classes for an order status (shared across order views). */
export function orderStatusClasses(status: string): string {
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

/** Order statuses that count as "active" for the product delete guard. */
export const ACTIVE_ORDER_STATUSES = [
  "pending",
  "confirmed",
  "shipped",
] as const;

/**
 * Return the Tailwind class string for the Add to Cart / stock button.
 * Different styles communicate whether the product is purchasable.
 */
export function getButtonClasses(inStock: boolean): string {
  const base =
    "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";

  if (inStock) {
    return `${base} bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500 cursor-pointer`;
  }

  return `${base} bg-zinc-200 text-zinc-400 cursor-not-allowed focus:ring-zinc-300`;
}
