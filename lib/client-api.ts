// Client-side data helpers that call the app's OWN Next.js route handlers
// (same origin → no CORS). Those handlers proxy to the external Flask API
// server-side. Use these from Client Components; use lib/api.ts from Server
// Components.

import type {
  Category,
  CategoryInput,
  CreateOrderPayload,
  LoginPayload,
  Order,
  Product,
  ProductInput,
  RegisterPayload,
  User,
} from "./types";

/**
 * Shared helper: call a same-origin API route and throw an Error carrying the
 * backend's `error`/`message` on a non-OK response.
 */
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, { cache: "no-store", ...init });

  if (!res.ok) {
    let message = `Request failed with status ${res.status}`;
    try {
      const body = (await res.json()) as { error?: string; message?: string };
      message = body.error ?? body.message ?? message;
    } catch {
      // keep default message
    }
    throw new Error(message);
  }

  // DELETE handlers may return an empty body.
  if (res.status === 204) return undefined as T;
  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

function jsonInit(method: string, body: unknown): RequestInit {
  return {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  };
}

// --- Products ---------------------------------------------------------------

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
  return request<Product[]>(`/api/products${qs ? `?${qs}` : ""}`);
}

export async function createProductClient(input: ProductInput): Promise<Product> {
  return request<Product>("/api/products", jsonInit("POST", input));
}

export async function updateProductClient(
  id: number,
  input: Partial<ProductInput>,
): Promise<Product> {
  return request<Product>(`/api/products/${id}`, jsonInit("PUT", input));
}

export async function deleteProductClient(id: number): Promise<void> {
  await request<void>(`/api/products/${id}`, { method: "DELETE" });
}

// --- Categories -------------------------------------------------------------

/** Fetch categories via the same-origin /api/categories route. */
export async function fetchCategoriesClient(): Promise<Category[]> {
  return request<Category[]>("/api/categories");
}

export async function createCategoryClient(
  input: CategoryInput,
): Promise<Category> {
  return request<Category>("/api/categories", jsonInit("POST", input));
}

export async function updateCategoryClient(
  id: number,
  input: Partial<CategoryInput>,
): Promise<Category> {
  return request<Category>(`/api/categories/${id}`, jsonInit("PUT", input));
}

export async function deleteCategoryClient(id: number): Promise<void> {
  await request<void>(`/api/categories/${id}`, { method: "DELETE" });
}

// --- Orders -----------------------------------------------------------------

export async function fetchOrdersClient(): Promise<Order[]> {
  return request<Order[]>("/api/orders");
}

export async function fetchOrderClient(id: number): Promise<Order> {
  return request<Order>(`/api/orders/${id}`);
}

export async function createOrderClient(
  payload: CreateOrderPayload,
): Promise<Order> {
  return request<Order>("/api/orders", jsonInit("POST", payload));
}

// --- Auth -------------------------------------------------------------------

export async function registerClient(payload: RegisterPayload): Promise<User> {
  return request<User>("/api/auth/register", jsonInit("POST", payload));
}

export async function loginClient(payload: LoginPayload): Promise<User> {
  return request<User>("/api/auth/login", jsonInit("POST", payload));
}
