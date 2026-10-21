"use client";

import toast from "react-hot-toast";
import { createCategoryClient } from "@/lib/client-api";
import type { Category, CategoryInput } from "@/lib/types";
import CategoryForm from "./CategoryForm";

export interface CreateCategoryFormProps {
  onCreated: (category: Category) => void;
}

/**
 * Create a category. Validates the name field (via CategoryForm), submits to
 * POST /categories, toasts, and hands the new category to the parent.
 */
export default function CreateCategoryForm({
  onCreated,
}: CreateCategoryFormProps) {
  async function handleSubmit(input: CategoryInput) {
    try {
      const created = await createCategoryClient(input);
      toast.success(`Created "${created.name}".`);
      onCreated(created);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create category.");
      throw err;
    }
  }

  return <CategoryForm submitLabel="Create category" onSubmit={handleSubmit} />;
}
