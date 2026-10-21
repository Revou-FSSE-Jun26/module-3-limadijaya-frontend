/** Centered loading message used by client-guarded pages while checking auth. */
export default function LoadingState({
  message = "Loading...",
}: {
  message?: string;
}) {
  return (
    <div
      role="status"
      className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-sm text-zinc-500"
    >
      <span className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-300 border-t-indigo-600" />
      {message}
    </div>
  );
}
