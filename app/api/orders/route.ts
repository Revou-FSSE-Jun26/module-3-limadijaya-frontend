import { NextResponse } from "next/server";
import { createOrder, getOrders } from "@/lib/api";
import { errorResponse } from "@/lib/route-helpers";
import type { CreateOrderPayload } from "@/lib/types";

/** List orders. Proxies to GET /orders. */
export async function GET() {
  try {
    const orders = await getOrders();
    return NextResponse.json(orders);
  } catch (error) {
    return errorResponse(error, "Failed to load orders.");
  }
}

/** Create an order at checkout. Proxies to POST /orders. */
export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as CreateOrderPayload;
    const order = await createOrder(payload);
    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    return errorResponse(error, "Failed to create order.");
  }
}
