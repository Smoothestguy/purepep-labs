import type { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth/user";
import { resolveAddress } from "@/lib/google-places";

/**
 * POST /api/address/resolve
 *
 * Turns a chosen prediction into street/city/state/zip. This is the call
 * that closes a Places billing session, so it must carry the same
 * sessionToken the suggest calls used.
 *
 * Sign-in required for the same reason as /api/address/suggest: the
 * upstream API charges per request.
 *
 * A null address is returned as `{ address: null }` with 200 — the form
 * then leaves whatever the customer typed alone rather than clearing it.
 */
export async function POST(request: NextRequest): Promise<Response> {
  const user = await getCurrentUser();
  if (!user) return Response.json({ address: null }, { status: 401 });

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return Response.json({ address: null }, { status: 400 });
  }

  const body = json as Record<string, unknown> | null;
  const placeId = typeof body?.placeId === "string" ? body.placeId : "";
  const sessionToken =
    typeof body?.sessionToken === "string" ? body.sessionToken : "";

  if (!placeId || !sessionToken) {
    return Response.json({ address: null }, { status: 200 });
  }

  const address = await resolveAddress(placeId, sessionToken);
  return Response.json({ address }, { status: 200 });
}
