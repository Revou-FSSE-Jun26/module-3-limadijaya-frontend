"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export interface SearchBarProps {
  /** Initial value of the input (e.g. read from the URL). */
  initialValue?: string;
  /** Placeholder text. */
  placeholder?: string;
  /** Fired on every keystroke with the current value. */
  onChange?: (value: string) => void;
  /**
   * Fired when the user submits (presses Enter / clicks Search).
   * When provided, it overrides the default URL navigation.
   */
  onSubmit?: (value: string) => void;
  /**
   * When no onSubmit is given, submitting navigates to
   * `${navigateTo}?search=${query}`. Defaults to "/products".
   */
  navigateTo?: string;
}

/**
 * Controlled search input.
 *
 * - Holds the query in local state and calls `onChange` on every keystroke.
 * - On submit: calls `onSubmit` if provided, otherwise uses router.push()
 *   to navigate to `/products?search=${query}` (search-by-URL).
 */
export default function SearchBar({
  initialValue = "",
  placeholder = "Search products...",
  onChange,
  onSubmit,
  navigateTo = "/products",
}: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialValue);

  function handleChange(value: string) {
    setQuery(value);
    onChange?.(value);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = query.trim();

    if (onSubmit) {
      onSubmit(trimmed);
      return;
    }

    // Search-by-URL: push /products?search=<query> (or clear the param).
    const target = trimmed
      ? `${navigateTo}?search=${encodeURIComponent(trimmed)}`
      : navigateTo;
    router.push(target);
  }

  return (
    <form onSubmit={handleSubmit} role="search" className="flex w-full gap-2">
      <input
        type="search"
        value={query}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        aria-label="Search products"
        className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
      />
      <button
        type="submit"
        className="shrink-0 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
      >
        Search
      </button>
    </form>
  );
}
