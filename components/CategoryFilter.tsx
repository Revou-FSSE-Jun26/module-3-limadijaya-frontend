"use client";

import { useEffect, useState } from "react";
import type { Category } from "@/lib/types";
import { fetchCategoriesClient } from "@/lib/client-api";

export interface CategoryFilterProps {
  /** Currently selected category id, or undefined for "All". */
  value?: number;
  /** Called when the selection changes. */
  onChange: (categoryId: number | undefined) => void;
}

/**
 * Dropdown that loads categories on mount (via the same-origin /api/categories
 * route, which proxies to GET /categories on the Flask API) and lets the user
 * pick a category to filter products by. Reports the chosen id to its parent.
 */
export default function CategoryFilter({ value, onChange }: CategoryFilterProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    fetchCategoriesClient()
      .then((data) => {
        if (active) setCategories(data);
      })
      .catch(() => {
        // Non-fatal: leave the dropdown with just "All categories".
        if (active) setCategories([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <label className="flex items-center gap-2 text-sm text-zinc-600">
      <span className="shrink-0">Category</span>
      <select
        value={value ?? ""}
        disabled={loading}
        onChange={(e) =>
          onChange(e.target.value ? Number(e.target.value) : undefined)
        }
        className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
      >
        <option value="">All categories</option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </select>
    </label>
  );
}
