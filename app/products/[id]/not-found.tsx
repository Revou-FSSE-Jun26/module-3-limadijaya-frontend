import Link from "next/link";

/**
 * Shown when getProduct() returns a 404 and the page calls notFound().
 */
export default function ProductNotFound() {
  return (
    <div className="mx-auto max-w-md rounded-xl border border-zinc-200 bg-white p-8 text-center">
      <h2 className="text-lg font-semibold text-zinc-900">Product not found</h2>
      <p className="mt-2 text-sm text-zinc-500">
        We couldn&rsquo;t find the product you&rsquo;re looking for.
      </p>
      <Link
        href="/products"
        className="mt-5 inline-flex rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
      >
        Back to products
      </Link>
    </div>
  );
}
