import { Suspense } from "react";
import { getCategories } from "@/lib/api";
import Card from "@/components/Card";

export const metadata = {
  title: "Categories",
  description: "Browse all RevoShop product categories, fetched live from the API.",
};

/**
 * Categories page. The live GET /categories fetch streams behind <Suspense>.
 */
export default function CategoriesPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-zinc-900">Categories</h1>
      <Suspense fallback={<CategoriesSkeleton />}>
        <CategoryList />
      </Suspense>
    </div>
  );
}

/** Inner Server Component that fetches GET /categories with async/await. */
async function CategoryList() {
  const categories = await getCategories();

  if (categories.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-zinc-500">
        No categories available.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {categories.map((category) => (
        <Card key={category.id} className="p-5">
          <h2 className="text-lg font-semibold text-zinc-900">
            {category.name}
          </h2>
          {category.description && (
            <p className="mt-2 text-sm text-zinc-500">{category.description}</p>
          )}
        </Card>
      ))}
    </div>
  );
}

function CategoriesSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="h-28 animate-pulse rounded-xl border border-zinc-200 bg-zinc-100"
        />
      ))}
    </div>
  );
}
