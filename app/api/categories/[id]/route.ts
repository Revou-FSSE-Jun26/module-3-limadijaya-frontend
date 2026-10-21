import { NextResponse } from "next/server";
import { deleteCategory, updateCategory } from "@/lib/api";
import { errorResponse } from "@/lib/route-helpers";
import type { CategoryInput } from "@/lib/types";

/** Update a category (admin). Proxies to PUT /categories/:id. */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const input = (await request.json()) as Partial<CategoryInput>;
    const category = await updateCategory(id, input);
    return NextResponse.json(category);
  } catch (error) {
    return errorResponse(error, "Failed to update category.");
  }
}

/** Delete a category (admin). Proxies to DELETE /categories/:id. */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    await deleteCategory(id);
    return NextResponse.json({ message: "Category deleted successfully" });
  } catch (error) {
    return errorResponse(error, "Failed to delete category.");
  }
}
