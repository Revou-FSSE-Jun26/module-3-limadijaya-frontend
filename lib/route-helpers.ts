// Shared helpers for the same-origin API route handlers (app/api/**).
// They translate thrown ApiErrors from the data layer into JSON responses
// with the correct HTTP status so client components can surface the message.

import { NextResponse } from "next/server";
import { ApiError } from "./api";

/** Convert a thrown error into a typed JSON error response. */
export function errorResponse(error: unknown, fallback: string): NextResponse {
  const status = error instanceof ApiError ? error.status : 500;
  const message = error instanceof Error ? error.message : fallback;
  return NextResponse.json({ error: message }, { status });
}
