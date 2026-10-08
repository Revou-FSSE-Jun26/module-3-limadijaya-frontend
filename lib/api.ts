// Centralized data-access helpers for the Module 2 Flask API.
//
// Every helper performs a `res.ok` check and throws a typed `ApiError` on
// failure so that App Router `error.tsx` boundaries can catch and display a
// friendly UI. These run in Server Components by default (no secrets leak to
// the browser), but the plain `fetch` calls also work from Client Components.

import { cache } from "react";
import type { ApiErrorBody, Category, Order, Product } from "./types";

/** Base URL of the Flask API, configured in .env.local. */
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://module-2-limadijaya.onrender.com";

/** A typed error carrying the HTTP status and the API's error message. */
export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

/**
 * Thin wrapper around fetch that:
 *  - targets the configured API base URL
 *  - disables caching so the demo always shows live data
 *  - throws a typed ApiError when `res.ok` is false
 */
async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${path}`;

  // The Module 2 API runs on Render's free tier, which sleeps after
  // inactivity. The first request can fail or hang during cold start, so we
  // retry a few times with a short backoff before surfacing a typed error.
  const maxAttempts = 4;
  let res: Response | undefined;
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      res = await fetch(url, { cache: "no-store", ...init });
      break;
    } catch (err) {
      lastError = err;
      if (attempt < maxAttempts) {
        // 0.75s, 1.5s, 2.25s backoff.
        await new Promise((r) => setTimeout(r, attempt * 750));
      }
    }
  }

  if (!res) {
    // Network-level failure (API asleep/unreachable). Surface as a typed error.
    throw new ApiError(
      lastError instanceof Error
        ? `Unable to reach the RevoShop API (${lastError.message}).`
        : "Unable to reach the RevoShop API. Please try again in a moment.",
      503,
    );
  }

  if (!res.ok) {
    // Try to extract the API's own { error } / { message } body.
    let detail = `Request failed with status ${res.status}`;
    try {
      const body = (await res.json()) as ApiErrorBody;
      detail = body.error ?? body.message ?? detail;
    } catch {
      // Response had no JSON body; keep the default message.
    }
    throw new ApiError(detail, res.status);
  }

  return (await res.json()) as T;
}

/** Build a query string from defined (non-undefined/empty) params. */
function buildQuery(params: Record<string, string | number | undefined>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") {
      search.set(key, String(value));
    }
  }
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

/**
 * Client-side fallback filtering.
 *
 * The Module 2 API currently ignores `search` and `category_id` query params
 * and always returns the full product list. We still send those params in the
 * URL (so the integration matches the rubric and keeps working if the backend
 * adds support later), but we also filter the returned data here so search and
 * category filtering are visibly functional end-to-end.
 */
function applyProductFilters(
  products: Product[],
  opts: { search?: string; categoryId?: number },
): Product[] {
  let result = products;

  if (opts.categoryId !== undefined) {
    result = result.filter((p) => p.category_id === opts.categoryId);
  }

  if (opts.search) {
    const needle = opts.search.toLowerCase();
    result = result.filter(
      (p) =>
        p.name.toLowerCase().includes(needle) ||
        (p.description ?? "").toLowerCase().includes(needle),
    );
  }

  return result;
}

// --- Products ---------------------------------------------------------------

export async function getProducts(opts: {
  search?: string;
  categoryId?: number;
} = {}): Promise<Product[]> {
  const query = buildQuery({
    search: opts.search,
    category_id: opts.categoryId,
  });
  const products = await apiFetch<Product[]>(`/products${query}`);
  return applyProductFilters(products, opts);
}

// Wrapped in React.cache so generateMetadata and the page component share a
// single request per id within the same render.
export const getProduct = cache(
  async (id: number | string): Promise<Product> => {
    return apiFetch<Product>(`/products/${id}`);
  },
);

// --- Categories -------------------------------------------------------------

export async function getCategories(): Promise<Category[]> {
  return apiFetch<Category[]>("/categories");
}

export async function getCategory(id: number | string): Promise<Category> {
  return apiFetch<Category>(`/categories/${id}`);
}

// --- Orders -----------------------------------------------------------------

export async function getOrders(): Promise<Order[]> {
  return apiFetch<Order[]>("/orders");
}

export async function getOrder(id: number | string): Promise<Order> {
  return apiFetch<Order>(`/orders/${id}`);
}
