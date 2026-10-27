// Shared, typed domain models mirroring the Module 2 Flask API responses.

/** A product as returned by GET /products and GET /products/:id. */
export interface Product {
  id: number;
  category_id: number;
  name: string;
  description: string | null;
  price: number;
  stock_quantity: number;
  created_at: string | null;
}

/** A category as returned by GET /categories and GET /categories/:id. */
export interface Category {
  id: number;
  name: string;
  description: string | null;
  /** Only present on GET /categories/:id (include_products=true). */
  products?: Product[];
}

/** A single line item inside a detailed order. */
export interface OrderItem {
  product_id: number;
  quantity: number;
  unit_price: number;
  product: Product | null;
}

/** An order as returned by GET /orders and GET /orders/:id. */
export interface Order {
  id: number;
  user_id: number;
  status: string;
  total_amount: number;
  created_at: string | null;
  /** Only present on GET /orders/:id (include_items=true). */
  items?: OrderItem[];
}

/** Shape of a validation-style error body returned by the API. */
export interface ApiErrorBody {
  error?: string;
  message?: string;
}

/**
 * Discriminated union modelling the two possible shapes of an API call result.
 * The `ok` literal is the discriminant: when `true` the value carries typed
 * `data`; when `false` it carries an error `message` and HTTP `status`. Callers
 * narrow on `result.ok` to access the right shape safely.
 */
export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; status: number; message: string };

/** User roles recognized by the app. The API defaults new users to "customer". */
export type UserRole = "customer" | "admin";

/**
 * An authenticated user as returned by POST /users (register) and the
 * `user` field of POST /auth/login. The API does not issue a token, so the
 * user object itself is the session and is persisted in localStorage.
 */
export interface User {
  id: number;
  username: string;
  email: string;
  role: UserRole;
  created_at: string | null;
}

/** Payload for POST /users (registration). */
export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
}

/** Payload for POST /auth/login. */
export interface LoginPayload {
  email: string;
  password: string;
}

/**
 * A single line in the shopping cart. Stored in localStorage and used to
 * build the POST /orders payload at checkout.
 */
export interface CartItem {
  product: Product;
  quantity: number;
}

/** A single line sent to POST /orders. */
export interface OrderItemInput {
  product_id: number;
  quantity: number;
}

/** Payload for POST /orders. */
export interface CreateOrderPayload {
  user_id: number;
  items: OrderItemInput[];
}

/** Payload for POST /products and (partial) PUT /products/:id. */
export interface ProductInput {
  name: string;
  description?: string | null;
  price: number;
  stock_quantity: number;
  category_id: number;
}

/** Payload for POST /categories and (partial) PUT /categories/:id. */
export interface CategoryInput {
  name: string;
  description?: string | null;
}
