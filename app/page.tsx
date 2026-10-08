import { Suspense } from "react";
import Link from "next/link";
import { getCategories, getProducts } from "@/lib/api";
import ProductCard from "@/components/ProductCard";
import ProductCatalog from "@/components/ProductCatalog";

export const metadata = {
  title: "Home",
  description:
    "Discover featured RevoShop products fetched live from the API, and try the interactive catalog.",
};

/**
 * Home page.
 *
 * Under Cache Components, uncached API fetches must stream behind a <Suspense>
 * boundary so the static shell (hero + headings + fallbacks) can be prerendered
 * while live data loads at request time. The actual fetching lives in the inner
 * async <FeaturedAndCatalog /> component below.
 */
export default function Home() {
  return (
    <div className="space-y-12">
      {/* Static hero — part of the prerendered shell */}
      <section className="rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 px-8 py-12 text-white">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Welcome to RevoShop
        </h1>
        <p className="mt-3 max-w-xl text-indigo-100">
          A storefront built with Next.js, powered by live data from the
          RevoShop Flask API.
        </p>
        <Link
          href="/products"
          className="mt-6 inline-flex rounded-md bg-white px-5 py-2.5 text-sm font-medium text-indigo-700 transition-colors hover:bg-indigo-50"
        >
          Browse all products
        </Link>
      </section>

      <Suspense fallback={<HomeDataSkeleton />}>
        <FeaturedAndCatalog />
      </Suspense>
    </div>
  );
}

/**
 * Inner Server Component that fetches live data. Wrapped in <Suspense> by the
 * parent so these uncached reads stream at request time.
 */
async function FeaturedAndCatalog() {
  const [products, categories] = await Promise.all([
    getProducts(),
    getCategories(),
  ]);

  const featured = products.slice(0, 5);

  return (
    <>
      {/* Featured products — read-only server-rendered cards */}
      <section>
        <div className="mb-5 flex items-end justify-between">
          <h2 className="text-xl font-semibold text-zinc-900">
            Featured products
          </h2>
          <Link
            href="/products"
            className="text-sm font-medium text-indigo-600 hover:underline"
          >
            View all &rarr;
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((product) => (
            // Read-only: no onAddToCart handler, so cards render without
            // interactive controls (pure Server Component output).
            <ProductCard
              key={product.id}
              product={product}
              showQuantity={false}
            />
          ))}
        </div>
      </section>

      {/* Interactive catalog exercise (Client Component) */}
      <section>
        <h2 className="mb-5 text-xl font-semibold text-zinc-900">
          Interactive catalog
        </h2>
        <p className="mb-5 max-w-2xl text-sm text-zinc-500">
          Search the catalog, add items to your cart, and add new products to
          the list. All interactions run on local state (immutable updates).
        </p>
        <ProductCatalog initialProducts={products} categories={categories} />
      </section>
    </>
  );
}

/** Loading placeholder shown while the home data streams in. */
function HomeDataSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-7 w-48 animate-pulse rounded bg-zinc-200" />
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-48 animate-pulse rounded-xl border border-zinc-200 bg-zinc-100"
          />
        ))}
      </div>
    </div>
  );
}
