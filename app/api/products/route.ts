import { NextResponse } from "next/server";
import { getProducts } from "@/lib/api";
import { ApiError } from "@/lib/api";

/**
 * Same-origin proxy for client-side product fetching.
 *
 * The browser calls this Next.js route (same origin → no CORS), and the route
 * calls the external Flask API server-side via the shared data layer. This
 * keeps the ProductList client component fetching on every query change while
 * avoiding CORS and the machine's TLS-proxy issues that affect direct
 * browser → external-API calls.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") ?? undefined;
  const categoryIdParam = searchParams.get("category_id");
  const categoryId = categoryIdParam ? Number(categoryIdParam) : undefined;

  try {
    const products = await getProducts({ search, categoryId });
    return NextResponse.json(products);
  } catch (error) {
    const status = error instanceof ApiError ? error.status : 500;
    const message =
      error instanceof Error ? error.message : "Failed to load products.";
    return NextResponse.json({ error: message }, { status });
  }
}
