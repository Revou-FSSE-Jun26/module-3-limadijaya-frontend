"use client";

import { useEffect } from "react";

/**
 * Error boundary for the /orders route.
 */
export default function OrdersError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error("Orders route error:", error);
  }, [error]);

  return (
    <div className="mx-auto max-w-md rounded-xl border border-red-200 bg-red-50 p-8 text-center">
      <h2 className="text-lg font-semibold text-red-800">
        We couldn&rsquo;t load the orders
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
