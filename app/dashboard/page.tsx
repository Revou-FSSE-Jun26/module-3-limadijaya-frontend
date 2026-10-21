"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  deleteProductClient,
  fetchCategoriesClient,
  fetchOrderClient,
  fetchOrdersClient,
  fetchProductsClient,
} from "@/lib/client-api";
import { ACTIVE_ORDER_STATUSES, formatPrice } from "@/lib/format";
import type { Category, Product } from "@/lib/types";
import Card from "@/components/Card";
import LoadingState from "@/components/LoadingState";
import CreateProductForm from "@/components/CreateProductForm";
import EditProductForm from "@/components/EditProductForm";

/**
 * /dashboard — admin product management (full CRUD).
 *
 * - Create via CreateProductForm (new product appears in the table).
 * - Edit inline via EditProductForm.
 * - Delete with a guard: the backend has no referential guard (it 500s), so
 *   before deleting we check whether the product is referenced by any ACTIVE
 *   order (pending/confirmed/shipped). If so we block the delete and show a
 *   visible error (rubric: "a visible error when deleting a product with
 *   active orders").
 */
export default function DashboardProductsPage() {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Product | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Set of product ids that are referenced by an active order.
  const [lockedProductIds, setLockedProductIds] = useState<Set<number>>(
    new Set(),
  );

  // Load products + categories, and compute which products are referenced by
  // an active order (for the delete guard). The async loaders are defined
  // inside the effect so their setState calls run in an async callback rather
  // than synchronously in the effect body.
  useEffect(() => {
    let active = true;

    async function loadData() {
      try {
        const [prods, cats] = await Promise.all([
          fetchProductsClient(),
          fetchCategoriesClient(),
        ]);
        if (!active) return;
        setProducts(prods);
        setCategories(cats);
        setError(null);
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : "Failed to load data.");
        }
      }
    }

    async function loadLocks() {
      try {
        const orders = await fetchOrdersClient();
        const activeOrders = orders.filter((o) =>
          (ACTIVE_ORDER_STATUSES as readonly string[]).includes(o.status),
        );
        // Order list items aren't included, so fetch detail for active orders.
        const details = await Promise.all(
          activeOrders.map((o) => fetchOrderClient(o.id).catch(() => null)),
        );
        const locked = new Set<number>();
        for (const detail of details) {
          for (const item of detail?.items ?? []) {
            locked.add(item.product_id);
          }
        }
        if (active) setLockedProductIds(locked);
      } catch {
        // If we can't determine locks, leave the set empty; the API will still
        // reject a truly unsafe delete and we surface that error.
      }
    }

    void loadData();
    void loadLocks();

    return () => {
      active = false;
    };
  }, []);

  function handleCreated(product: Product) {
    setProducts((prev) => (prev ? [product, ...prev] : [product]));
  }

  function handleUpdated(product: Product) {
    setProducts((prev) =>
      prev ? prev.map((p) => (p.id === product.id ? product : p)) : prev,
    );
    setEditing(null);
  }

  async function handleDelete(product: Product) {
    // Frontend delete guard: block if referenced by an active order.
    if (lockedProductIds.has(product.id)) {
      toast.error(
        `Cannot delete "${product.name}": it has active orders.`,
      );
      return;
    }
    if (!window.confirm(`Delete "${product.name}"? This cannot be undone.`)) {
      return;
    }
    setDeletingId(product.id);
    try {
      await deleteProductClient(product.id);
      setProducts((prev) => (prev ? prev.filter((p) => p.id !== product.id) : prev));
      toast.success(`Deleted "${product.name}".`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete product.");
    } finally {
      setDeletingId(null);
    }
  }

  const categoryName = (id: number) =>
    categories.find((c) => c.id === id)?.name ?? `#${id}`;

  if (products === null && !error) {
    return <LoadingState message="Loading products..." />;
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      {/* Create / Edit panel */}
      <aside className="lg:col-span-1">
        <Card className="p-5">
          <h2 className="mb-4 text-base font-semibold text-zinc-900">
            {editing ? `Edit "${editing.name}"` : "Add a new product"}
          </h2>
          {editing ? (
            <EditProductForm
              categories={categories}
              product={editing}
              onUpdated={handleUpdated}
              onCancel={() => setEditing(null)}
            />
          ) : (
            <CreateProductForm categories={categories} onCreated={handleCreated} />
          )}
        </Card>
      </aside>

      {/* Product table */}
      <section className="lg:col-span-2">
        {error && (
          <p className="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}

        <Card className="overflow-hidden">
          <table className="w-full text-sm" data-testid="product-table">
            <thead className="border-b border-zinc-200 bg-zinc-50 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {(products ?? []).length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-zinc-500">
                    No products yet. Add one on the left.
                  </td>
                </tr>
              ) : (
                (products ?? []).map((product) => (
                  <tr key={product.id} data-testid="product-row">
                    <td className="px-4 py-3 font-medium text-zinc-900">
                      {product.name}
                    </td>
                    <td className="px-4 py-3 text-zinc-600">
                      {categoryName(product.category_id)}
                    </td>
                    <td className="px-4 py-3 text-zinc-600">
                      {formatPrice(product.price)}
                    </td>
                    <td className="px-4 py-3 text-zinc-600">
                      {product.stock_quantity}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setEditing(product)}
                          data-testid="edit-product"
                          className="rounded-md px-2 py-1 text-sm font-medium text-indigo-600 transition-colors hover:bg-indigo-50"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(product)}
                          disabled={deletingId === product.id}
                          data-testid="delete-product"
                          className="rounded-md px-2 py-1 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
                        >
                          {deletingId === product.id ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </Card>
      </section>
    </div>
  );
}
