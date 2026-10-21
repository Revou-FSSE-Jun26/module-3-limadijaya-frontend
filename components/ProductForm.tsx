"use client";

import { useState, type FormEvent } from "react";
import type { Category, Product, ProductInput } from "@/lib/types";

interface ProductFormValues {
  name: string;
  description: string;
  price: string;
  stock_quantity: string;
  category_id: string;
}

interface ProductFormErrors {
  name?: string;
  price?: string;
  stock_quantity?: string;
  category_id?: string;
}

export interface ProductFormProps {
  categories: Category[];
  /** Existing product when editing; omit for create. */
  initial?: Product;
  /** Label for the submit button. */
  submitLabel: string;
  /** Called with a validated ProductInput. Should throw to surface an error. */
  onSubmit: (input: ProductInput) => Promise<void>;
  /** Optional cancel handler (shown as a secondary button when provided). */
  onCancel?: () => void;
}

function toValues(product?: Product): ProductFormValues {
  return {
    name: product?.name ?? "",
    description: product?.description ?? "",
    price: product ? String(product.price) : "",
    stock_quantity: product ? String(product.stock_quantity) : "",
    category_id: product ? String(product.category_id) : "",
  };
}

/** Validate the product form; empty object means valid. */
export function validateProduct(data: ProductFormValues): ProductFormErrors {
  const errors: ProductFormErrors = {};

  if (!data.name.trim()) {
    errors.name = "Product name is required.";
  }

  const price = Number(data.price);
  if (!data.price.trim()) {
    errors.price = "Price is required.";
  } else if (Number.isNaN(price) || price <= 0) {
    errors.price = "Price must be a number greater than zero.";
  }

  if (!data.stock_quantity.trim()) {
    errors.stock_quantity = "Stock quantity is required.";
  } else {
    const stock = Number(data.stock_quantity);
    if (!Number.isInteger(stock) || stock < 0) {
      errors.stock_quantity = "Stock must be a non-negative whole number.";
    }
  }

  if (!data.category_id) {
    errors.category_id = "Please choose a category.";
  }

  return errors;
}

const fieldClasses =
  "w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500";

/**
 * Shared controlled form for creating and editing a product. Validation runs
 * on submit; the parent handles the actual API call (and toasts) via onSubmit.
 */
export default function ProductForm({
  categories,
  initial,
  submitLabel,
  onSubmit,
  onCancel,
}: ProductFormProps) {
  const [values, setValues] = useState<ProductFormValues>(toValues(initial));
  const [errors, setErrors] = useState<ProductFormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  function update<K extends keyof ProductFormValues>(field: K, value: string) {
    setValues((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validationErrors = validateProduct(values);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setSubmitting(true);
    try {
      await onSubmit({
        name: values.name.trim(),
        description: values.description.trim() || null,
        price: Number(values.price),
        stock_quantity: Number(values.stock_quantity),
        category_id: Number(values.category_id),
      });
      // On create (no initial), reset for the next entry.
      if (!initial) {
        setValues(toValues());
        setErrors({});
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <div>
        <label htmlFor="pf-name" className="mb-1 block text-sm font-medium text-zinc-700">
          Product name
        </label>
        <input
          id="pf-name"
          name="name"
          type="text"
          value={values.name}
          onChange={(e) => update("name", e.target.value)}
          className={fieldClasses}
        />
        {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
      </div>

      <div>
        <label htmlFor="pf-description" className="mb-1 block text-sm font-medium text-zinc-700">
          Description <span className="text-zinc-400">(optional)</span>
        </label>
        <textarea
          id="pf-description"
          name="description"
          rows={2}
          value={values.description}
          onChange={(e) => update("description", e.target.value)}
          className={fieldClasses}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="pf-price" className="mb-1 block text-sm font-medium text-zinc-700">
            Price (USD)
          </label>
          <input
            id="pf-price"
            name="price"
            type="number"
            step="0.01"
            min="0"
            value={values.price}
            onChange={(e) => update("price", e.target.value)}
            className={fieldClasses}
          />
          {errors.price && <p className="mt-1 text-xs text-red-600">{errors.price}</p>}
        </div>

        <div>
          <label htmlFor="pf-stock" className="mb-1 block text-sm font-medium text-zinc-700">
            Stock quantity
          </label>
          <input
            id="pf-stock"
            name="stock_quantity"
            type="number"
            min="0"
            value={values.stock_quantity}
            onChange={(e) => update("stock_quantity", e.target.value)}
            className={fieldClasses}
          />
          {errors.stock_quantity && (
            <p className="mt-1 text-xs text-red-600">{errors.stock_quantity}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="pf-category" className="mb-1 block text-sm font-medium text-zinc-700">
          Category
        </label>
        <select
          id="pf-category"
          name="category_id"
          value={values.category_id}
          onChange={(e) => update("category_id", e.target.value)}
          className={fieldClasses}
        >
          <option value="">Select a category</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        {errors.category_id && (
          <p className="mt-1 text-xs text-red-600">{errors.category_id}</p>
        )}
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Saving..." : submitLabel}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
