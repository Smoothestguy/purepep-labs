import type { NextRequest } from "next/server";
import type {
  CheckoutRequest,
  CheckoutResponse,
  CheckoutShipping,
} from "@/lib/nmi/types";

/**
 * POST /api/checkout
 *
 * Phase 2 is a structural stub. We validate the payload, log an order
 * record, and return a mock approval. No real gateway call is made.
 *
 * TODO(Phase 3): real NMI transact.php POST.
 *   - Read `NMI_SECURITY_KEY` and form-encode a request against
 *     https://secure.networkmerchants.com/api/transact.php with:
 *       type=sale, payment_token=<token>, amount=<total>, + shipping/email
 *   - Parse the x-www-form-urlencoded response. `response=1` is approval.
 *   - Persist the order row (Supabase) with the gateway transaction id.
 *   - Send the confirmation email (Resend / Postmark) with the order id.
 *   - Never log raw card data — we only ever hold the one-time token.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isString(v: unknown): v is string {
  return typeof v === "string" && v.length > 0;
}

function validateShipping(s: unknown): s is CheckoutShipping {
  if (typeof s !== "object" || s === null) return false;
  const r = s as Record<string, unknown>;
  return (
    isString(r.firstName) &&
    isString(r.lastName) &&
    isString(r.address1) &&
    isString(r.city) &&
    isString(r.state) &&
    isString(r.zip) &&
    isString(r.phone)
  );
}

function validatePayload(body: unknown): body is CheckoutRequest {
  if (typeof body !== "object" || body === null) return false;
  const r = body as Record<string, unknown>;
  if (!isString(r.token)) return false;
  if (!isString(r.email) || !EMAIL_RE.test(r.email.trim())) return false;
  if (!validateShipping(r.shipping)) return false;
  if (!Array.isArray(r.items) || r.items.length === 0) return false;
  if (typeof r.total !== "number" || r.total <= 0) return false;
  for (const item of r.items) {
    if (typeof item !== "object" || item === null) return false;
    const i = item as Record<string, unknown>;
    if (!isString(i.slug) || !isString(i.name) || !isString(i.accession)) {
      return false;
    }
    if (typeof i.price !== "number" || typeof i.quantity !== "number") {
      return false;
    }
  }
  return true;
}

function generateOrderId(): string {
  return `PP-${Date.now().toString(36).toUpperCase()}`;
}

export async function POST(
  request: NextRequest,
): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      { ok: false, error: "Invalid JSON body." } satisfies CheckoutResponse,
      { status: 400 },
    );
  }

  if (!validatePayload(body)) {
    return Response.json(
      {
        ok: false,
        error:
          "Missing or invalid fields. Expected token, email, shipping, items, total.",
      } satisfies CheckoutResponse,
      { status: 400 },
    );
  }

  // Secret key is server-only. We don't use it in Phase 2 — just warn if
  // it's missing so the operator knows the real gateway isn't configured.
  const securityKey = process.env.NMI_SECURITY_KEY;
  if (!securityKey) {
    console.warn(
      "[checkout] NMI_SECURITY_KEY is not set — proceeding with mock approval only.",
    );
  }

  const orderId = generateOrderId();

  // Log a structured record. The CollectJS token is opaque and one-time,
  // so it is safe to log; we still never log PAN/CVV (we never have them).
  console.log("[checkout] mock-approval", {
    orderId,
    email: body.email,
    itemCount: body.items.length,
    total: body.total,
    token: body.token === "MOCK" ? "MOCK" : "<redacted>",
    shippingCity: body.shipping.city,
    shippingState: body.shipping.state,
  });

  return Response.json(
    {
      ok: true,
      orderId,
      message:
        body.token === "MOCK"
          ? "Mock approval — payment processing in demo mode (no gateway)."
          : "Mock approval — NMI gateway not wired in Phase 2.",
    } satisfies CheckoutResponse,
    { status: 200 },
  );
}
