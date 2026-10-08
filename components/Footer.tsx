/**
 * Site footer rendered on every page by the root layout.
 * Pure Server Component — no interactivity, so no "use client".
 */
// Static year constant: computed at build time, safe to prerender.
// (Avoids `new Date()` at render time, which Next.js 16 flags as unstable.)
const BUILD_YEAR = new Date().getFullYear();

export default function Footer() {
  const year = BUILD_YEAR;

  return (
    <footer className="mt-auto border-t border-zinc-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-6 text-sm text-zinc-500 sm:flex-row">
        <p>&copy; {year} RevoShop. Built for RevoU Module 3.</p>
        <p>
          Data served live from the{" "}
          <span className="font-medium text-zinc-700">RevoShop Flask API</span>.
        </p>
      </div>
    </footer>
  );
}
