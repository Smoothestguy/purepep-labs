import "server-only";

import type Stripe from "stripe";
import { stripeClient } from "./config";
import type { PricedOrder } from "@/lib/pricing";
import type { CheckoutShipping } from "@/lib/checkout/types";

const CURRENCY = "usd";

/**
 * Stripe rejects an `expires_at` under 30 minutes out. We ask for 60 so a
 * few seconds of clock skew can't push the request under the floor.
 */
const SESSION_TTL_SECONDS = 60 * 60;

export type SessionResult =
  | { ok: true; sessionId: string; url: string }
  | { ok: false; error: string };

export type CreateSessionInput = {
  order: PricedOrder;
  orderRef: string;
  email: string;
  userId: string;
  shipping: CheckoutShipping;
  /** Absolute origin for success/cancel URLs, e.g. https://thepurepep.com */
  origin: string;
};

/**
 * Build a Checkout Session for an already-priced order.
 *
 * Prices go over as inline `price_data`, not as references to Price
 * objects in the Stripe dashboard. That keeps `lib/compounds.ts` the only
 * place a price is written down — with dashboard Prices, editing the
 * catalog would keep charging the old amount until someone remembered to
 * mirror the change, and nothing in the code would catch the drift.
 *
 * Note the session is created *after* the caller has already written a
 * pending order row, so `orderRef` is always a ref that exists.
 */
export async function createCheckoutSession(
  input: CreateSessionInput,
): Promise<SessionResult> {
  const stripe = stripeClient();
  if (!stripe) return { ok: false, error: "Stripe is not configured." };

  const { order, orderRef, email, userId, shipping, origin } = input;

  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] =
    order.items.map((item) => ({
      quantity: item.quantity,
      price_data: {
        currency: CURRENCY,
        unit_amount: item.unit_price_cents,
        product_data: {
          name: `${item.name} · ${item.dose}`,
          description: `${item.accession} — for laboratory research use only. Not for human consumption.`,
          metadata: {
            slug: item.slug,
            accession: item.accession,
            dose: item.dose,
          },
        },
      },
    }));

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      customer_email: email,
      client_reference_id: orderRef,

      // AVS data is the cheapest fraud signal available on a card-not-present
      // sale, and this catalog is a chargeback magnet.
      billing_address_collection: "required",

      expires_at: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,

      // The ref rides on both the session and the PaymentIntent: the
      // webhook reads it off the session, while anyone reconciling a
      // charge in the Stripe dashboard sees it on the payment itself.
      metadata: { order_ref: orderRef, user_id: userId },
      payment_intent_data: {
        description: `The Pure Pep order ${orderRef}`,
        metadata: { order_ref: orderRef, user_id: userId },
        shipping: {
          name: `${shipping.firstName} ${shipping.lastName}`.trim(),
          phone: shipping.phone,
          address: {
            line1: shipping.address1,
            line2: shipping.address2 || undefined,
            city: shipping.city,
            state: shipping.state,
            postal_code: shipping.zip,
            country: "US",
          },
        },
      },

      // Shipping is charged as a rate rather than a line item so Stripe's
      // own total matches `order.totalCents` exactly — the webhook asserts
      // on that equality.
      shipping_options:
        order.shippingCents > 0
          ? [
              {
                shipping_rate_data: {
                  type: "fixed_amount",
                  display_name: "Cold-chain dispatch",
                  fixed_amount: {
                    amount: order.shippingCents,
                    currency: CURRENCY,
                  },
                },
              },
            ]
          : undefined,

      success_url: `${origin}/checkout/success?order=${encodeURIComponent(
        orderRef,
      )}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout?cancelled=1`,
    });

    if (!session.url) {
      return { ok: false, error: "Stripe did not return a checkout URL." };
    }

    return { ok: true, sessionId: session.id, url: session.url };
  } catch (err) {
    // Stripe's raw messages can name internal parameters; log them but
    // hand the customer something generic.
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[stripe] ${orderRef}: session create failed —`, message);
    return { ok: false, error: "Could not start the payment session." };
  }
}

/** Fetch a session for the post-redirect receipt page. Null if unavailable. */
export async function retrieveSession(
  sessionId: string,
): Promise<Stripe.Checkout.Session | null> {
  const stripe = stripeClient();
  if (!stripe) return null;
  try {
    return await stripe.checkout.sessions.retrieve(sessionId);
  } catch (err) {
    console.error(
      "[stripe] session retrieve failed:",
      err instanceof Error ? err.message : err,
    );
    return null;
  }
}

/**
 * Resolve the PaymentIntent id off a session, which the SDK types as
 * either an id or an expanded object depending on the request.
 */
export function paymentIntentId(session: Stripe.Checkout.Session): string | null {
  const pi = session.payment_intent;
  if (!pi) return null;
  return typeof pi === "string" ? pi : pi.id;
}
