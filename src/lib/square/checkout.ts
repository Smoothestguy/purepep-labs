import "server-only";

import type { CheckoutShipping } from "@/lib/checkout/types";
import type { PricedOrder } from "@/lib/pricing";
import {
  isSquareConfigured,
  squareBaseUrl,
  squareHeaders,
} from "./config";

/**
 * Square hosted checkout, via the Payment Links API.
 *
 * Same shape as the Stripe integration deliberately: mint a hosted page,
 * redirect, and let the webhook settle the order. Nothing here may ever
 * mark an order paid — the customer reaching the success page is not
 * evidence that money moved.
 *
 * Correlation back to our order is by Square's `order_id`, which the
 * create response returns and the payment webhook carries. The order ref
 * also goes in `payment_note` so a human reconciling a payment in the
 * Square dashboard can see which order it belongs to.
 */

const CURRENCY = "USD";
const TIMEOUT_MS = 20_000;

export type SquareLinkResult =
  | { ok: true; url: string; squareOrderId: string; paymentLinkId: string }
  | { ok: false; error: string };

type LineItem = {
  name: string;
  quantity: string;
  base_price_money: { amount: number; currency: string };
};

/**
 * Square requires a location for every order. Resolved from env when set,
 * otherwise looked up once and cached for the life of the instance —
 * most accounts have exactly one location and making the operator hunt
 * for its id is friction with nothing behind it.
 */
let cachedLocationId: string | null = null;

async function resolveLocationId(): Promise<string | null> {
  const configured = process.env.SQUARE_LOCATION_ID?.trim();
  if (configured) return configured;
  if (cachedLocationId) return cachedLocationId;

  try {
    const res = await fetch(`${squareBaseUrl()}/v2/locations`, {
      headers: squareHeaders(),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) {
      console.error(`[square] locations lookup returned ${res.status}`);
      return null;
    }
    const json = (await res.json()) as {
      locations?: Array<{ id?: string; status?: string }>;
    };
    const active =
      json.locations?.find((l) => l.status === "ACTIVE" && l.id) ??
      json.locations?.find((l) => l.id);
    cachedLocationId = active?.id ?? null;
    return cachedLocationId;
  } catch (err) {
    console.error(
      "[square] locations lookup failed:",
      err instanceof Error ? err.message : err,
    );
    return null;
  }
}

export async function createPaymentLink(input: {
  order: PricedOrder;
  orderRef: string;
  email: string;
  origin: string;
  shipping: CheckoutShipping;
}): Promise<SquareLinkResult> {
  if (!isSquareConfigured()) {
    return { ok: false, error: "Square is not configured." };
  }

  const locationId = await resolveLocationId();
  if (!locationId) {
    return { ok: false, error: "Could not resolve a Square location." };
  }

  const { order, orderRef, email, origin, shipping } = input;

  // Charged prices, not list prices — any discount is already baked in
  // by lib/pricing, and the line items must sum to the total we recorded.
  const lineItems: LineItem[] = order.items.map((item) => ({
    name: `${item.name} · ${item.dose}`,
    quantity: String(item.quantity),
    base_price_money: {
      amount: item.charged_unit_price_cents,
      currency: CURRENCY,
    },
  }));

  // Shipping rides as its own line rather than through Square's
  // fulfillment model: we already collected the address ourselves, and a
  // plain line keeps the order total exactly equal to what we stored.
  if (order.chargedShippingCents > 0) {
    lineItems.push({
      name: "Cold-chain dispatch",
      quantity: "1",
      base_price_money: {
        amount: order.chargedShippingCents,
        currency: CURRENCY,
      },
    });
  }

  const body = {
    // Keyed on our order ref, so a retried request can never create a
    // second payment link for the same order.
    idempotency_key: `order-${orderRef}`,
    order: {
      location_id: locationId,
      line_items: lineItems,
    },
    checkout_options: {
      // We collect shipping on our own form, so Square must not ask again.
      ask_for_shipping_address: false,
      redirect_url: `${origin}/checkout/success?order=${encodeURIComponent(orderRef)}&pending=1`,
    },
    pre_populated_data: { buyer_email: email },
    payment_note: paymentNote(orderRef, shipping),
  };

  try {
    const res = await fetch(
      `${squareBaseUrl()}/v2/online-checkout/payment-links`,
      {
        method: "POST",
        headers: squareHeaders(),
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(TIMEOUT_MS),
      },
    );

    const json = (await res.json()) as {
      payment_link?: { id?: string; url?: string; order_id?: string };
      errors?: Array<{ detail?: string; code?: string }>;
    };

    if (!res.ok || !json.payment_link?.url) {
      // Square returns a structured errors array; log it in full because
      // it names the exact field or permission at fault.
      const detail =
        json.errors?.map((e) => `${e.code}: ${e.detail}`).join("; ") ??
        `HTTP ${res.status}`;
      console.error(`[square] ${orderRef}: payment link failed — ${detail}`);
      return { ok: false, error: "Could not start the payment session." };
    }

    return {
      ok: true,
      url: json.payment_link.url,
      squareOrderId: json.payment_link.order_id ?? "",
      paymentLinkId: json.payment_link.id ?? "",
    };
  } catch (err) {
    console.error(
      `[square] ${orderRef}: payment link request failed:`,
      err instanceof Error ? err.message : err,
    );
    return { ok: false, error: "Could not start the payment session." };
  }
}

/**
 * The note Square shows on the payment in its dashboard: our order ref
 * plus who and where to ship to, so an order can be packed straight from
 * Square without opening our admin page. Square caps the note at 500
 * characters; an address never comes close, but it is clipped regardless
 * so an unusually long one can't fail the payment link.
 */
function paymentNote(orderRef: string, s: CheckoutShipping): string {
  const name = `${s.firstName} ${s.lastName}`.trim();
  const street = [s.address1, s.address2].filter(Boolean).join(", ");
  const place = `${s.city}, ${s.state} ${s.zip}`.trim();
  const parts = [
    `The Pure Pep order ${orderRef}`,
    `Ship to: ${[name, street, place].filter(Boolean).join(", ")}`,
    s.phone ? `Phone: ${s.phone}` : "",
  ].filter(Boolean);
  return parts.join(" · ").slice(0, 500);
}
