import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ApiError, getCategory, getProduct } from "@/lib/api";
import { formatPrice } from "@/lib/format";
import Card from "@/components/Card";

/**
 * Dynamic page title: fetches the product by id and uses its real name as the
 * <title>. Falls back to a generic title if the product can't be loaded.
 * `params` is a Promise in Next.js 16 and must be awaited.
 */
export async function generateMetadata({
  params,
}: PageProps<"/products/[id]">): Promise<Metadata> {
  const { id } = await params;

  try {
    const product = await getProduct(id);
    return {
      title: product.name,
      description: product.description ?? `Details for ${product.name}.`,
    };
  } catch {
    return { title: `Product #${id}` };
  }
}

/**
 * Product detail page.
 *
 * The route param and live fetch stream behind <Suspense> so the "Back" link
 * ships in the static shell while the product detail loads at request time.
 */
export default function ProductDetailPage({
  params,
}: PageProps<"/products/[id]">) {
  return (
    <div className="space-y-6">
      <Link
        href="/products"
        className="inline-flex text-sm font-medium text-indigo-600 hover:underline"
      >
        &larr; Back to products
      </Link>

      <Suspense fallback={<ProductDetailSkeleton />}>
        <ProductDetail params={params} />
      </Suspense>
    </div>
  );
}

/**
 * Inner Server Component that resolves the id, fetches the product (and its
 * category), and renders the detail. A 404 renders the not-found UI; other
 * failures bubble to error.tsx.
 */
async function ProductDetail({
  params,
}: {
  params: PageProps<"/products/[id]">["params"];
}) {
  const { id } = await params;

  let product;
  try {
    product = await getProduct(id);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }
    throw error;
  }

  // Category is best-effort; a failure here shouldn't blow up the page.
  let categoryName: string | null = null;
  try {
    const category = await getCategory(product.category_id);
    categoryName = category.name;
  } catch {
    categoryName = null;
  }

  const inStock = product.stock_quantity > 0;

  return (
    <Card className="p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">{product.name}</h1>
          {categoryName && (
            <p className="mt-1 text-sm text-zinc-500">
              Category:{" "}
              <Link
                href="/categories"
                className="font-medium text-indigo-600 hover:underline"
              >
                {categoryName}
              </Link>
            </p>
          )}
        </div>
        {inStock ? (
          <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
            {product.stock_quantity} in stock
          </span>
        ) : (
          <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-700">
            Out of stock
          </span>
        )}
      </div>

      <p className="mt-6 text-3xl font-bold text-zinc-900">
        {formatPrice(product.price)}
      </p>

      {product.description && (
        <p className="mt-4 max-w-2xl text-zinc-600">{product.description}</p>
      )}
    </Card>
  );
}

function ProductDetailSkeleton() {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-8">
      <div className="h-7 w-2/3 animate-pulse rounded bg-zinc-200" />
      <div className="mt-4 h-9 w-32 animate-pulse rounded bg-zinc-200" />
      <div className="mt-6 h-4 w-full animate-pulse rounded bg-zinc-100" />
      <div className="mt-2 h-4 w-5/6 animate-pulse rounded bg-zinc-100" />
    </div>
  );
}
