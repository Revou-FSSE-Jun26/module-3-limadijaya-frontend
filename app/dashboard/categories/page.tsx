"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  deleteCategoryClient,
  fetchCategoriesClient,
  fetchProductsClient,
} from "@/lib/client-api";
import type { Category, Product } from "@/lib/types";
import Card from "@/components/Card";
import LoadingState from "@/components/LoadingState";
import CreateCategoryForm from "@/components/CreateCategoryForm";
import EditCategoryForm from "@/components/EditCategoryForm";

/**
 * /dashboard/categories — admin category management (full CRUD).
 *
 * Delete guard: the backend 500s when a category still has linked products, so
 * we compute a per-category product count from the products list and block the
 * delete with a visible error when any products are linked (rubric: "deletion
 * guard when linked products exist").
 */
export default function DashboardCategoriesPage() {
  const [categories, setCategories] = useState<Category[] | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Category | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    let active = true;

    async function loadData() {
      try {
        const [cats, prods] = await Promise.all([
          fetchCategoriesClient(),
          fetchProductsClient(),
        ]);
        if (!active) return;
        setCategories(cats);
        setProducts(prods);
        setError(null);
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : "Failed to load data.");
        }
      }
    }

    void loadData();

    return () => {
      active = false;
    };
  }, []);

  const linkedCount = (categoryId: number) =>
    products.filter((p) => p.category_id === categoryId).length;

  function handleCreated(category: Category) {
    setCategories((prev) => (prev ? [category, ...prev] : [category]));
  }

  function handleUpdated(category: Category) {
    setCategories((prev) =>
      prev ? prev.map((c) => (c.id === category.id ? category : c)) : prev,
    );
    setEditing(null);
  }

  async function handleDelete(category: Category) {
    const count = linkedCount(category.id);
    if (count > 0) {
      toast.error(
        `Cannot delete "${category.name}": ${count} product${
          count === 1 ? "" : "s"
        } still linked.`,
      );
      return;
    }
    if (!window.confirm(`Delete "${category.name}"?`)) return;

    setDeletingId(category.id);
    try {
      await deleteCategoryClient(category.id);
      setCategories((prev) =>
        prev ? prev.filter((c) => c.id !== category.id) : prev,
      );
      toast.success(`Deleted "${category.name}".`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete category.");
    } finally {
      setDeletingId(null);
    }
  }

  if (categories === null && !error) {
    return <LoadingState message="Loading categories..." />;
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <aside className="lg:col-span-1">
        <Card className="p-5">
          <h2 className="mb-4 text-base font-semibold text-zinc-900">
            {editing ? `Edit "${editing.name}"` : "Add a new category"}
          </h2>
          {editing ? (
            <EditCategoryForm
              category={editing}
              onUpdated={handleUpdated}
              onCancel={() => setEditing(null)}
            />
          ) : (
            <CreateCategoryForm onCreated={handleCreated} />
          )}
        </Card>
      </aside>

      <section className="lg:col-span-2">
        {error && (
          <p className="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}

        <Card className="overflow-hidden">
          <table className="w-full text-sm" data-testid="category-table">
            <thead className="border-b border-zinc-200 bg-zinc-50 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3">Products</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {(categories ?? []).length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-zinc-500">
                    No categories yet. Add one on the left.
                  </td>
                </tr>
              ) : (
                (categories ?? []).map((category) => (
                  <tr key={category.id} data-testid="category-row">
                    <td className="px-4 py-3 font-medium text-zinc-900">
                      {category.name}
                    </td>
                    <td className="px-4 py-3 text-zinc-600">
                      {category.description || <span className="text-zinc-400">—</span>}
                    </td>
                    <td className="px-4 py-3 text-zinc-600">
                      {linkedCount(category.id)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setEditing(category)}
                          data-testid="edit-category"
                          className="rounded-md px-2 py-1 text-sm font-medium text-indigo-600 transition-colors hover:bg-indigo-50"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(category)}
                          disabled={deletingId === category.id}
                          data-testid="delete-category"
                          className="rounded-md px-2 py-1 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
                        >
                          {deletingId === category.id ? "Deleting..." : "Delete"}
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
