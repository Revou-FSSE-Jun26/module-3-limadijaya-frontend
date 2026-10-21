import { NextResponse } from "next/server";
import { createCategory, getCategories } from "@/lib/api";
import { errorResponse } from "@/lib/route-helpers";
import type { CategoryInput } from "@/lib/types";

/**
 * Same-origin proxy for client-side category fetching (used by CategoryFilter
 * and the admin dashboard). Calls the external Flask API server-side.
 */
export async function GET() {
  try {
    const categories = await getCategories();
    return NextResponse.json(categories);
  } catch (error) {
    return errorResponse(error, "Failed to load categories.");
  }
}

/** Create a category (admin dashboard). Proxies to POST /categories. */
export async function POST(request: Request) {
  try {
    const input = (await request.json()) as CategoryInput;
    const category = await createCategory(input);
    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    return errorResponse(error, "Failed to create category.");
  }
}
