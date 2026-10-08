"use client";

import { useEffect } from "react";

/**
 * Logs once when the products layout mounts. Because the nested products
 * layout is preserved across navigation between /products and /products/[id],
 * this message appears a single time per visit to the subtree — not again on
 * each list <-> detail transition. Watch the browser console to verify the
 * nested layout does not re-render.
 */
export default function ProductsLayoutMountLogger() {
  useEffect(() => {
    console.log("[ProductsLayout] mounted — persists across /products navigation");
  }, []);

  return null;
}
