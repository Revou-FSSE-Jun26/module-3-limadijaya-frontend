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
