import { NextResponse } from "next/server";
import { deleteProduct, updateProduct } from "@/lib/api";
import { errorResponse } from "@/lib/route-helpers";
import type { ProductInput } from "@/lib/types";

/** Update a product (admin). Proxies to PUT /products/:id. */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const input = (await request.json()) as Partial<ProductInput>;
    const product = await updateProduct(id, input);
    return NextResponse.json(product);
  } catch (error) {
    return errorResponse(error, "Failed to update product.");
  }
}

/** Delete a product (admin). Proxies to DELETE /products/:id. */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    await deleteProduct(id);
    return NextResponse.json({ message: "Product deleted successfully" });
  } catch (error) {
    return errorResponse(error, "Failed to delete product.");
  }
}
