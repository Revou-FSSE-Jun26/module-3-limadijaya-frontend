"use client";

import { useMemo, useState } from "react";
import type { Category, Product } from "@/lib/types";
import SearchBar from "./SearchBar";
import ProductGrid from "./ProductGrid";
import AddProductForm from "./AddProductForm";
import CartSummary from "./CartSummary";

export interface ProductCatalogProps {
  /** Seed products fetched live from the API by the server. */
  initialProducts: Product[];
  /** Categories for the AddProductForm dropdown. */
  categories: Category[];
}

/**
 * The complete interactive catalog exercise, all wired together:
 *  - product list renders from local state
 *  - the search bar filters the list live (no navigation)
 *  - "Add to Cart" appends to cart state immutably
 *  - the cart summary shows item count and total
 *  - AddProductForm appends new products using the immutable spread pattern
 */
export default function ProductCatalog({
  initialProducts,
  categories,
}: ProductCatalogProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [cart, setCart] = useState<Product[]>([]);
  const [search, setSearch] = useState("");

  // Live, in-memory filtering as the user types.
  const visibleProducts = useMemo(() => {
    const needle = search.trim().toLowerCase();
    if (!needle) return products;
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(needle) ||
        (p.description ?? "").toLowerCase().includes(needle),
    );
  }, [products, search]);

  // Immutable update: never mutate the existing cart array.
  function handleAddToCart(product: Product) {
    setCart((prev) => [...prev, product]);
  }

  // Immutable append of a newly created product to the catalog.
  function handleAddProduct(product: Product) {
    setProducts((prev) => [product, ...prev]);
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <SearchBar
          placeholder="Filter the catalog..."
          onChange={setSearch}
          onSubmit={setSearch}
        />
        <ProductGrid
          products={visibleProducts}
          onAddToCart={handleAddToCart}
          emptyMessage="No products match your search."
        />
      </div>

      <aside className="space-y-6">
        <CartSummary cart={cart} />
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-base font-semibold text-zinc-900">
            Add a product
          </h3>
          <AddProductForm categories={categories} onAdd={handleAddProduct} />
        </div>
      </aside>
    </div>
  );
}
