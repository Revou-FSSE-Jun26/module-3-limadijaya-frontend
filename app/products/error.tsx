"use client";

import { useEffect } from "react";

/**
 * Error boundary for the /products subtree. Catches typed errors thrown by the
 * data layer (e.g. a failed res.ok check or the API being unreachable) and
 * shows a friendly, recoverable UI.
 *
 * Note: in Next.js 16 the recovery prop is `retry` (not `reset`).
 */
export default function ProductsError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error("Products route error:", error);
  }, [error]);

  return (
    <div className="mx-auto max-w-md rounded-xl border border-red-200 bg-red-50 p-8 text-center">
      <h2 className="text-lg font-semibold text-red-800">
        We couldn&rsquo;t load the products
      </h2>
      <p className="mt-2 text-sm text-red-600">
        {error.message || "Something went wrong while contacting the API."}
      </p>
      <button
        type="button"
        onClick={() => retry()}
        className="mt-5 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
      >
        Try again
      </button>
    </div>
  );
}
