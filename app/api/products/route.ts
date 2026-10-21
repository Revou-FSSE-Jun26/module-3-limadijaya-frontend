import { NextResponse } from "next/server";
import { createProduct, getProducts } from "@/lib/api";
import { errorResponse } from "@/lib/route-helpers";
import type { ProductInput } from "@/lib/types";

/**
 * Same-origin proxy for client-side product fetching.
 *
 * The browser calls this Next.js route (same origin → no CORS), and the route
 * calls the external Flask API server-side via the shared data layer.
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
    return errorResponse(error, "Failed to load products.");
  }
}

/** Create a product (admin dashboard). Proxies to POST /products. */
export async function POST(request: Request) {
  try {
    const input = (await request.json()) as ProductInput;
    const product = await createProduct(input);
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    return errorResponse(error, "Failed to create product.");
  }
}
