import type { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth/user";
import { lookupDiscount } from "@/lib/discounts";

/**
 * POST /api/discount/validate
 *
 * Tells the checkout page what a code is worth so the order summary can
 * show the saving before the customer commits. A discount field that
 * changes nothing on screen until after payment is worse than no field.
 *
 * This is a preview only — it is never what applies the discount. The
 * checkout handler re-resolves the code from scratch, so a tampered
 * response here buys nothing.
 *
 * Sign-in required. This endpoint is an oracle for "is this a code", and
 * requiring an account keeps that behind registration rather than leaving
 * it open to anonymous guessing.
 */
export async function POST(request: NextRequest): Promise<Response> {
  const user = await getCurrentUser();
  if (!user) {
    return Response.json({ valid: false }, { status: 401 });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return Response.json({ valid: false }, { status: 400 });
  }

  const code =
    typeof json === "object" && json !== null
      ? (json as Record<string, unknown>).code
      : undefined;

  const discount = lookupDiscount(code);
  if (!discount) {
    return Response.json({ valid: false }, { status: 200 });
  }

  // Only the canonical spelling and the percent go back — never the list
  // of configured codes.
  return Response.json(
    { valid: true, code: discount.code, percent: discount.percent },
    { status: 200 },
  );
}
