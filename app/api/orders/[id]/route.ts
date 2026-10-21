import { NextResponse } from "next/server";
import { getOrder } from "@/lib/api";
import { errorResponse } from "@/lib/route-helpers";

/** Get a single order with its items. Proxies to GET /orders/:id. */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const order = await getOrder(id);
    return NextResponse.json(order);
  } catch (error) {
    return errorResponse(error, "Failed to load order.");
  }
}
