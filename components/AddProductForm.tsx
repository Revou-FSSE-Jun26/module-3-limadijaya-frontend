"use client";

import { useState, type FormEvent } from "react";
import type { Category, Product } from "@/lib/types";

/** Raw string values held by the controlled form inputs. */
export interface FormState {
  name: string;
  description: string;
  price: string;
  stock_quantity: string;
  category_id: string;
}

/** Per-field validation messages. A field is only present when invalid. */
export interface FormErrors {
  name?: string;
  price?: string;
  stock_quantity?: string;
  category_id?: string;
}

export interface AddProductFormProps {
  /** Categories to populate the dropdown. */
  categories: Category[];
  /**
   * Called with a well-formed Product (negative id for client-only items)
   * when the form passes validation.
   */
  onAdd: (product: Product) => void;
}

const EMPTY_FORM: FormState = {
  name: "",
  description: "",
  price: "",
  stock_quantity: "",
  category_id: "",
};

/**
 * Validate the form data and return a map of field -> error message.
 * An empty object means the form is valid.
 */
export function validate(data: FormState): FormErrors {
  const errors: FormErrors = {};

  if (!data.name.trim()) {
    errors.name = "Product name is required.";
  }

  const price = Number(data.price);
  if (!data.price.trim()) {
    errors.price = "Price is required.";
  } else if (Number.isNaN(price) || price <= 0) {
    errors.price = "Price must be a number greater than zero.";
  }

  if (data.stock_quantity.trim()) {
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

/**
 * Controlled form for adding a product to the local catalog.
 *
 * Every input is bound to state; validate() runs on submit and renders error
 * messages conditionally beneath each field. On success it builds a Product
 * and hands it to onAdd (local state only at this checkpoint).
 */
export default function AddProductForm({
  categories,
  onAdd,
}: AddProductFormProps) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});

  function update<K extends keyof FormState>(field: K, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validationErrors = validate(form);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    const newProduct: Product = {
      // Negative, time-based id keeps client-only products unique and clearly
      // distinct from real server ids.
      id: -Date.now(),
      name: form.name.trim(),
      description: form.description.trim() || null,
      price: Number(form.price),
      stock_quantity: form.stock_quantity.trim()
        ? Number(form.stock_quantity)
        : 0,
      category_id: Number(form.category_id),
      created_at: null,
    };

    onAdd(newProduct);
    setForm(EMPTY_FORM);
    setErrors({});
  }

  const fieldClasses =
    "w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500";

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {/* Name */}
      <div>
        <label htmlFor="name" className="mb-1 block text-sm font-medium text-zinc-700">
          Product name
        </label>
        <input
          id="name"
          type="text"
          value={form.name}
          onChange={(e) => update("name", e.target.value)}
          className={fieldClasses}
        />
        {errors.name && (
          <p className="mt-1 text-xs text-red-600">{errors.name}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label
          htmlFor="description"
          className="mb-1 block text-sm font-medium text-zinc-700"
        >
          Description <span className="text-zinc-400">(optional)</span>
        </label>
        <textarea
          id="description"
          rows={2}
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
          className={fieldClasses}
        />
      </div>

      {/* Price + Stock */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="price" className="mb-1 block text-sm font-medium text-zinc-700">
            Price (USD)
          </label>
          <input
            id="price"
            type="number"
            step="0.01"
            min="0"
            value={form.price}
            onChange={(e) => update("price", e.target.value)}
            className={fieldClasses}
          />
          {errors.price && (
            <p className="mt-1 text-xs text-red-600">{errors.price}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="stock_quantity"
            className="mb-1 block text-sm font-medium text-zinc-700"
          >
            Stock quantity
          </label>
          <input
            id="stock_quantity"
            type="number"
            min="0"
            value={form.stock_quantity}
            onChange={(e) => update("stock_quantity", e.target.value)}
            className={fieldClasses}
          />
          {errors.stock_quantity && (
            <p className="mt-1 text-xs text-red-600">{errors.stock_quantity}</p>
          )}
        </div>
      </div>

      {/* Category */}
      <div>
        <label
          htmlFor="category_id"
          className="mb-1 block text-sm font-medium text-zinc-700"
        >
          Category
        </label>
        <select
          id="category_id"
          value={form.category_id}
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

      <button
        type="submit"
        className="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
      >
        Add product
      </button>
    </form>
  );
}
