import type { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth/user";
import { suggestAddresses } from "@/lib/google-places";

/**
 * POST /api/address/suggest
 *
 * Address predictions for the checkout form. Sign-in required — Places
 * bills per request, so leaving this open would let anyone run up the
 * bill by hammering it. Checkout already requires an account, so this
 * costs a real customer nothing.
 *
 * Always answers 200 with a list. A failed or unconfigured lookup returns
 * an empty list rather than an error, so the field quietly behaves like a
 * plain text input instead of blocking someone mid-address.
 */
export async function POST(request: NextRequest): Promise<Response> {
  const user = await getCurrentUser();
  if (!user) return Response.json({ suggestions: [] }, { status: 401 });

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return Response.json({ suggestions: [] }, { status: 400 });
  }

  const body = json as Record<string, unknown> | null;
  const input = typeof body?.input === "string" ? body.input : "";
  const sessionToken =
    typeof body?.sessionToken === "string" ? body.sessionToken : "";

  if (!input || !sessionToken) {
    return Response.json({ suggestions: [] }, { status: 200 });
  }

  const suggestions = await suggestAddresses(input, sessionToken);
  return Response.json({ suggestions }, { status: 200 });
}
