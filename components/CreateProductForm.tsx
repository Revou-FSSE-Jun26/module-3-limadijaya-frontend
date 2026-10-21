"use client";

import toast from "react-hot-toast";
import { createProductClient } from "@/lib/client-api";
import type { Category, Product, ProductInput } from "@/lib/types";
import ProductForm from "./ProductForm";

export interface CreateProductFormProps {
  categories: Category[];
  /** Called with the created product so the table can prepend it. */
  onCreated: (product: Product) => void;
}

/**
 * Create a product. Submits to POST /products (via the same-origin proxy),
 * toasts on success/error, and hands the new product to the parent so it
 * appears in the product table immediately.
 */
export default function CreateProductForm({
  categories,
  onCreated,
}: CreateProductFormProps) {
  async function handleSubmit(input: ProductInput) {
    try {
      const created = await createProductClient(input);
      toast.success(`Created "${created.name}".`);
      onCreated(created);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create product.");
      throw err; // keep the form populated on failure
    }
  }

  return (
    <ProductForm
      categories={categories}
      submitLabel="Create product"
      onSubmit={handleSubmit}
    />
  );
}
