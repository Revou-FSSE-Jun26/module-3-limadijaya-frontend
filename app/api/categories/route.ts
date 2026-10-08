import { NextResponse } from "next/server";
import { getCategories } from "@/lib/api";
import { ApiError } from "@/lib/api";

/**
 * Same-origin proxy for client-side category fetching (used by CategoryFilter).
 * Calls the external Flask API server-side to avoid CORS.
 */
export async function GET() {
  try {
    const categories = await getCategories();
    return NextResponse.json(categories);
  } catch (error) {
    const status = error instanceof ApiError ? error.status : 500;
    const message =
      error instanceof Error ? error.message : "Failed to load categories.";
    return NextResponse.json({ error: message }, { status });
  }
}
