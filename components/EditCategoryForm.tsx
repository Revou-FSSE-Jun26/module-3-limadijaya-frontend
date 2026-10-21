"use client";

import toast from "react-hot-toast";
import { updateCategoryClient } from "@/lib/client-api";
import type { Category, CategoryInput } from "@/lib/types";
import CategoryForm from "./CategoryForm";

export interface EditCategoryFormProps {
  category: Category;
  onUpdated: (category: Category) => void;
  onCancel: () => void;
}

/** Edit an existing category. Submits to PUT /categories/:id. */
export default function EditCategoryForm({
  category,
  onUpdated,
  onCancel,
}: EditCategoryFormProps) {
  async function handleSubmit(input: CategoryInput) {
    try {
      const updated = await updateCategoryClient(category.id, input);
      toast.success(`Updated "${updated.name}".`);
      onUpdated(updated);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update category.");
      throw err;
    }
  }

  return (
    <CategoryForm
      initial={category}
      submitLabel="Save changes"
      onSubmit={handleSubmit}
      onCancel={onCancel}
    />
  );
}
