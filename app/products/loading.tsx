/**
 * Skeleton UI shown while the /products Server Component fetches data.
 * Automatically wrapped in a <Suspense> boundary by the App Router.
 */
export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-40 animate-pulse rounded bg-zinc-200" />
      <div className="h-10 w-full animate-pulse rounded bg-zinc-200" />
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
