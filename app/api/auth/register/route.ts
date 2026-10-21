import { NextResponse } from "next/server";
import { registerUser } from "@/lib/api";
import { errorResponse } from "@/lib/route-helpers";
import type { RegisterPayload } from "@/lib/types";

/** Register a new user. Proxies to POST /users on the Flask API. */
export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as RegisterPayload;
    const user = await registerUser(payload);
    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    return errorResponse(error, "Failed to register.");
  }
}
