import type { Product } from "@/lib/types";
import ProductCard from "./ProductCard";

export interface ProductGridProps {
  /** Products to render. */
  products: Product[];
  /** Optional add-to-cart handler passed through to each card. */
  onAddToCart?: (product: Product, quantity: number) => void;
  /** Message shown when the list is empty. */
  emptyMessage?: string;
}

/**
 * Responsive grid that renders a single ProductCard per product via .map()
 * over a Product[] array (replacing any hardcoded card instances).
 */
export default function ProductGrid({
  products,
  onAddToCart,
  emptyMessage = "No products found.",
}: ProductGridProps) {
  if (products.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-zinc-500">{emptyMessage}</p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onAddToCart={onAddToCart}
        />
      ))}
    </div>
  );
}
