"use client";

import { useState, type FormEvent } from "react";
import type { Category, CategoryInput } from "@/lib/types";

interface CategoryFormValues {
  name: string;
  description: string;
}

interface CategoryFormErrors {
  name?: string;
}

export interface CategoryFormProps {
  initial?: Category;
  submitLabel: string;
  onSubmit: (input: CategoryInput) => Promise<void>;
  onCancel?: () => void;
}

/** Validate the category form; empty object means valid. */
export function validateCategory(data: CategoryFormValues): CategoryFormErrors {
  const errors: CategoryFormErrors = {};
  if (!data.name.trim()) {
    errors.name = "Category name is required.";
  } else if (data.name.trim().length < 2) {
    errors.name = "Category name must be at least 2 characters.";
  }
  return errors;
}

const fieldClasses =
  "w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500";

/** Shared controlled form for creating/editing a category. */
export default function CategoryForm({
  initial,
  submitLabel,
  onSubmit,
  onCancel,
}: CategoryFormProps) {
  const [values, setValues] = useState<CategoryFormValues>({
    name: initial?.name ?? "",
    description: initial?.description ?? "",
  });
  const [errors, setErrors] = useState<CategoryFormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validationErrors = validateCategory(values);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setSubmitting(true);
    try {
      await onSubmit({
        name: values.name.trim(),
        description: values.description.trim() || null,
      });
      if (!initial) {
        setValues({ name: "", description: "" });
        setErrors({});
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <div>
        <label htmlFor="cf-name" className="mb-1 block text-sm font-medium text-zinc-700">
          Category name
        </label>
        <input
          id="cf-name"
          name="name"
          type="text"
          value={values.name}
          onChange={(e) => setValues((p) => ({ ...p, name: e.target.value }))}
          className={fieldClasses}
        />
        {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
      </div>

      <div>
        <label htmlFor="cf-description" className="mb-1 block text-sm font-medium text-zinc-700">
          Description <span className="text-zinc-400">(optional)</span>
        </label>
        <textarea
          id="cf-description"
          name="description"
          rows={2}
          value={values.description}
          onChange={(e) =>
            setValues((p) => ({ ...p, description: e.target.value }))
          }
          className={fieldClasses}
        />
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
