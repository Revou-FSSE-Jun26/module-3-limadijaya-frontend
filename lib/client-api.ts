// Client-side data helpers that call the app's OWN Next.js route handlers
// (same origin → no CORS). Those handlers proxy to the external Flask API
// server-side. Use these from Client Components; use lib/api.ts from Server
// Components.

import type { Category, Product } from "./types";

/** Fetch products via the same-origin /api/products route. */
export async function fetchProductsClient(opts: {
  search?: string;
  categoryId?: number;
} = {}): Promise<Product[]> {
  const params = new URLSearchParams();
  if (opts.search) params.set("search", opts.search);
  if (opts.categoryId !== undefined) {
    params.set("category_id", String(opts.categoryId));
  }
  const qs = params.toString();

  const res = await fetch(`/api/products${qs ? `?${qs}` : ""}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    let message = `Request failed with status ${res.status}`;
    try {
      const body = (await res.json()) as { error?: string };
      message = body.error ?? message;
    } catch {
      // keep default message
    }
    throw new Error(message);
  }

  return (await res.json()) as Product[];
}

/** Fetch categories via the same-origin /api/categories route. */
export async function fetchCategoriesClient(): Promise<Category[]> {
  const res = await fetch("/api/categories", { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Request failed with status ${res.status}`);
  }
  return (await res.json()) as Category[];
}
