/**
 * Skeleton shown while /orders fetches data.
 */
export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-32 animate-pulse rounded bg-zinc-200" />
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-20 animate-pulse rounded-xl border border-zinc-200 bg-zinc-100"
          />
        ))}
      </div>
    </div>
  );
}
