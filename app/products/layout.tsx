import ProductsLayoutMountLogger from "@/components/ProductsLayoutMountLogger";

/**
 * Nested layout for the /products subtree.
 *
 * This layout stays mounted while navigating between /products and
 * /products/[id] — the App Router preserves shared layouts across those
 * transitions and only swaps the page segment. The mount logger below prints
 * exactly once; it does NOT re-print on navigation between the list and a
 * detail page, which is how you can verify the layout is not re-rendering.
 */
export default function ProductsLayout({ children }: LayoutProps<"/products">) {
  return (
    <section>
      <ProductsLayoutMountLogger />
      {children}
    </section>
  );
}
