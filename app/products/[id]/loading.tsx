/**
 * Skeleton shown while a single product is fetched on /products/[id].
 */
export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="h-5 w-32 animate-pulse rounded bg-zinc-200" />
      <div className="rounded-xl border border-zinc-200 bg-white p-8">
        <div className="h-7 w-2/3 animate-pulse rounded bg-zinc-200" />
        <div className="mt-4 h-9 w-32 animate-pulse rounded bg-zinc-200" />
        <div className="mt-6 h-4 w-full animate-pulse rounded bg-zinc-100" />
        <div className="mt-2 h-4 w-5/6 animate-pulse rounded bg-zinc-100" />
      </div>
    </div>
  );
}
