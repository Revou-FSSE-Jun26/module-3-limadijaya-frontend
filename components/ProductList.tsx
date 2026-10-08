"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { Product } from "@/lib/types";
import { fetchProductsClient } from "@/lib/client-api";
import SearchBar from "./SearchBar";
import CategoryFilter from "./CategoryFilter";
import ProductGrid from "./ProductGrid";

export interface ProductListProps {
  /** Initial products provided by the Server Component parent. */
  products: Product[];
}

/**
 * Interactive product browser.
 *
 * - Receives the initial server-fetched products as a prop.
 * - SearchBar navigates to /products?search=${query} on Enter (search-by-URL).
 * - A useEffect reads useSearchParams() and refetches products whenever the
 *   query or category changes. The browser fetch targets the app's own
 *   same-origin /api/products route (which proxies to GET /products on the
 *   Flask API server-side), avoiding CORS on direct browser → API calls.
 * - CategoryFilter loads categories on mount and triggers a refetch on
 *   selection.
 */
export default function ProductList({ products }: ProductListProps) {
  const searchParams = useSearchParams();
  const search = searchParams.get("search") ?? "";

  const [items, setItems] = useState<Product[]>(products);
  const [categoryId, setCategoryId] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Refetch whenever the URL search query or the selected category changes.
  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchProductsClient({
          search: search || undefined,
          categoryId,
        });
        if (active) setItems(data);
      } catch (err: unknown) {
        if (active) {
          setError(
            err instanceof Error ? err.message : "Failed to load products.",
          );
          setItems([]);
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void load();

    return () => {
      active = false;
    };
  }, [search, categoryId]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex-1">
          <SearchBar initialValue={search} navigateTo="/products" />
        </div>
        <CategoryFilter value={categoryId} onChange={setCategoryId} />
      </div>

      {/* Reflect the active search term read from the URL. */}
      {search && (
        <p className="text-sm text-zinc-500">
          Showing results for{" "}
          <span className="font-medium text-zinc-800">&ldquo;{search}&rdquo;</span>
        </p>
      )}

      {error && (
        <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {loading ? (
        <p className="py-12 text-center text-sm text-zinc-500">
          Loading products...
        </p>
      ) : (
        <ProductGrid
          products={items}
          emptyMessage="No products match your filters."
        />
      )}
    </div>
  );
}
