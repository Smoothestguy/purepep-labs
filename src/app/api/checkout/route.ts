import type { NextRequest } from "next/server";
import type { CheckoutResponse, CheckoutShipping } from "@/lib/nmi/types";
import { chargeCard, isGatewayConfigured } from "@/lib/nmi/gateway";
import { priceOrder, type RequestedLine } from "@/lib/pricing";
import {
  createPendingOrder,
  generateOrderRef,
  markOrderFailed,
  markOrderPaid,
} from "@/lib/orders";
import { createClient } from "@/lib/supabase/server";
import { sendOrderConfirmation } from "@/lib/email";

/**
 * POST /api/checkout
 *
 * Order of operations matters here:
 *   1. Validate the payload shape.
 *   2. Re-price the cart from the catalog — the browser's prices and total
 *      are ignored entirely (see lib/pricing).
 *   3. Write a 'pending' order, so a row exists even if step 4 dies.
 *   4. Charge the CollectJS token.
 *   5. Mark paid/failed, then email the customer.
 *
 * Card data never reaches this handler — only the one-time token.
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

type ParsedBody = {
  token: string;
  email: string;
  shipping: CheckoutShipping;
  lines: RequestedLine[];
};

function parseBody(body: unknown): ParsedBody | null {
  if (typeof body !== "object" || body === null) return null;
  const r = body as Record<string, unknown>;

  if (!isString(r.token)) return null;
  if (!isString(r.email) || !EMAIL_RE.test(r.email.trim())) return null;
  if (!validateShipping(r.shipping)) return null;
  if (!Array.isArray(r.items) || r.items.length === 0) return null;

  const lines: RequestedLine[] = [];
  for (const item of r.items) {
    if (typeof item !== "object" || item === null) return null;
    const i = item as Record<string, unknown>;
    // Note: any `price` the client sent is intentionally discarded.
    if (!isString(i.slug) || !isString(i.dose)) return null;
    if (typeof i.quantity !== "number") return null;
    lines.push({ slug: i.slug, dose: i.dose, quantity: i.quantity });
  }

  return {
    token: r.token,
    email: r.email.trim(),
    shipping: r.shipping,
    lines,
  };
}

function fail(error: string, status: number): Response {
  return Response.json({ ok: false, error } satisfies CheckoutResponse, {
    status,
  });
}

/**
 * Mock approvals are a development affordance. Allowing them in production
 * would mean customers receive "order confirmed" pages for money that was
 * never taken — so they are off unless explicitly opted into.
 */
function mockAllowed(): boolean {
  if (process.env.ALLOW_MOCK_CHECKOUT === "true") return true;
  return process.env.NODE_ENV !== "production";
}

export async function POST(request: NextRequest): Promise<Response> {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return fail("Invalid JSON body.", 400);
  }

  const body = parseBody(json);
  if (!body) {
    return fail(
      "Missing or invalid fields. Expected token, email, shipping, items.",
      400,
    );
  }

  // ── Authoritative pricing ────────────────────────────────────────────
  const priced = priceOrder(body.lines);
  if (!priced.ok) return fail(priced.error, 400);
  const { items, subtotalCents, shippingCents, totalCents } = priced.order;

  const gatewayReady = isGatewayConfigured();
  if (!gatewayReady && !mockAllowed()) {
    return fail(
      "Card payments are not available yet. Please contact us to place this order.",
      503,
    );
  }

  // Attach the order to a signed-in user when there is one. Guest checkout
  // still works — user_id is simply null.
  let userId: string | null = null;
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    userId = user?.id ?? null;
  } catch {
    // Supabase not configured locally — proceed as a guest order.
  }

  const orderRef = generateOrderRef();

  // ── Persist before charging ──────────────────────────────────────────
  let persisted = true;
  try {
    await createPendingOrder({
      orderRef,
      userId,
      email: body.email,
      items,
      shipping: body.shipping,
      subtotalCents,
      shippingCents,
      totalCents,
    });
  } catch (err) {
    persisted = false;
    const message = err instanceof Error ? err.message : String(err);
    console.error("[checkout] could not persist order:", message);

    // In production, taking money we cannot attribute to an order is worse
    // than declining the sale.
    if (process.env.NODE_ENV === "production") {
      return fail(
        "We could not record your order. No payment was taken. Please try again.",
        503,
      );
    }
  }

  // ── Charge ───────────────────────────────────────────────────────────
  if (!gatewayReady) {
    console.warn(
      `[checkout] ${orderRef}: gateway not configured — mock approval (no payment taken).`,
    );
    return Response.json(
      {
        ok: true,
        orderId: orderRef,
        message:
          "Mock approval — no payment was taken (gateway not configured).",
      } satisfies CheckoutResponse,
      { status: 200 },
    );
  }

  const charge = await chargeCard({
    token: body.token,
    amountCents: totalCents,
    email: body.email,
    shipping: body.shipping,
    orderRef,
  });

  if (!charge.ok) {
    if (persisted) {
      await markOrderFailed(orderRef, charge.message, charge.raw);
    }
    console.warn(`[checkout] ${orderRef}: ${charge.kind} — ${charge.message}`);
    // 402 for a genuine decline; 502 when the processor itself misbehaved.
    return fail(charge.message, charge.kind === "declined" ? 402 : 502);
  }

  if (persisted) {
    try {
      await markOrderPaid(orderRef, {
        transactionId: charge.transactionId,
        authCode: charge.authCode,
        raw: charge.raw,
      });
    } catch (err) {
      // The customer's card was charged — never fail the response here.
      console.error(
        `[checkout] ${orderRef}: charged but not marked paid:`,
        err instanceof Error ? err.message : err,
      );
    }
  }

  // Confirmation email is best-effort; a mail outage must not turn a
  // successful payment into an error page.
  try {
    await sendOrderConfirmation({
      to: body.email,
      orderRef,
      items,
      subtotalCents,
      shippingCents,
      totalCents,
    });
  } catch (err) {
    console.error(
      `[checkout] ${orderRef}: confirmation email failed:`,
      err instanceof Error ? err.message : err,
    );
  }

  return Response.json(
    {
      ok: true,
      orderId: orderRef,
      message: "Payment approved.",
    } satisfies CheckoutResponse,
    { status: 200 },
  );
}
