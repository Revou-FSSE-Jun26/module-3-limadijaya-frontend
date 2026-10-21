import { NextResponse } from "next/server";
import { loginUser } from "@/lib/api";
import { errorResponse } from "@/lib/route-helpers";
import type { LoginPayload } from "@/lib/types";

/** Log a user in. Proxies to POST /auth/login and returns the user object. */
export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as LoginPayload;
    const user = await loginUser(payload);
    return NextResponse.json(user);
  } catch (error) {
    return errorResponse(error, "Failed to log in.");
  }
}
