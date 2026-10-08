import { Suspense } from "react";
import { getProducts } from "@/lib/api";
import ProductList from "@/components/ProductList";

export const metadata = {
  title: "Products",
  description:
    "Browse the full RevoShop catalog with live search and category filtering.",
};

/**
 * Products listing page.
 *
 * The live GET /products fetch happens inside <ProductsBrowser />, which is
 * wrapped in <Suspense> so the heading ships in the static shell and the data
 * streams at request time (Cache Components model). ProductList also uses
 * useSearchParams(), which likewise requires a Suspense boundary.
 */
export default function ProductsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-zinc-900">Products</h1>
      <Suspense
        fallback={
          <p className="py-12 text-center text-sm text-zinc-500">
            Loading catalog...
          </p>
        }
      >
        <ProductsBrowser />
      </Suspense>
    </div>
  );
}

/** Inner Server Component performing the live fetch. */
async function ProductsBrowser() {
  const products = await getProducts();
  return <ProductList products={products} />;
}
