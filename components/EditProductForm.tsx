"use client";

import toast from "react-hot-toast";
import { updateProductClient } from "@/lib/client-api";
import type { Category, Product, ProductInput } from "@/lib/types";
import ProductForm from "./ProductForm";

export interface EditProductFormProps {
  categories: Category[];
  /** The product being edited. */
  product: Product;
  /** Called with the updated product so the table can replace the row. */
  onUpdated: (product: Product) => void;
  /** Close the edit form without saving. */
  onCancel: () => void;
}

/**
 * Edit an existing product. Submits to PUT /products/:id, toasts, and returns
 * the updated product to the parent.
 */
export default function EditProductForm({
  categories,
  product,
  onUpdated,
  onCancel,
}: EditProductFormProps) {
  async function handleSubmit(input: ProductInput) {
    try {
      const updated = await updateProductClient(product.id, input);
      toast.success(`Updated "${updated.name}".`);
      onUpdated(updated);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update product.");
      throw err;
    }
  }

  return (
    <ProductForm
      categories={categories}
      initial={product}
      submitLabel="Save changes"
      onSubmit={handleSubmit}
      onCancel={onCancel}
    />
  );
}
