import type { NextRequest } from "next/server";
import type Stripe from "stripe";
import { stripeClient, stripeWebhookSecret } from "@/lib/stripe/config";
import { paymentIntentId } from "@/lib/stripe/checkout";
import {
  findOrderByRef,
  markOrderPaidByStripe,
  markStripeSessionExpired,
} from "@/lib/orders";
import { sendOrderConfirmation } from "@/lib/email";

/**
 * POST /api/webhooks/stripe
 *
 * This is where a Stripe card order actually becomes paid. The browser's
 * return to /checkout/success is a courtesy — the customer can close the
 * tab, lose signal, or never come back — so fulfilment hangs off the
 * webhook and nothing else.
 *
 * Three rules this handler exists to enforce:
 *
 *   1. Verify the signature against the *raw* body. Anyone can POST here;
 *      the signature is the only thing separating Stripe from an attacker
 *      marking their own orders paid.
 *   2. Be idempotent. Stripe retries on failure and replays on demand, so
 *      every state change is guarded and the confirmation email is sent
 *      only on the transition, never on a redelivery.
 *   3. Return 2xx once the event is handled, even for events we ignore —
 *      a non-2xx tells Stripe to retry forever.
 *
 * Note the proxy matcher excludes /api, so the site-lock password gate
 * does not shadow this route while the site is pre-launch.
 */

// The Stripe SDK and signature verification want the Node runtime.
export const runtime = "nodejs";

function ok(): Response {
  return Response.json({ received: true }, { status: 200 });
}

export async function POST(request: NextRequest): Promise<Response> {
  const stripe = stripeClient();
  const secret = stripeWebhookSecret();

  if (!stripe || !secret) {
    console.error("[stripe-webhook] not configured — rejecting delivery.");
    // 503 rather than 200: retries are the correct behaviour while the
    // endpoint is misconfigured, so events aren't silently dropped.
    return Response.json({ error: "Not configured." }, { status: 503 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return Response.json({ error: "Missing signature." }, { status: 400 });
  }

  // Must be the exact bytes Stripe signed — parsing to JSON first would
  // re-serialise and invalidate the signature.
  const payload = await request.text();

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(
      payload,
      signature,
      secret,
    );
  } catch (err) {
    console.warn(
      "[stripe-webhook] signature verification failed:",
      err instanceof Error ? err.message : err,
    );
    return Response.json({ error: "Invalid signature." }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded": {
        await handleSessionPaid(event.data.object);
        break;
      }

      case "checkout.session.async_payment_failed": {
        const session = event.data.object;
        console.warn(
          `[stripe-webhook] async payment failed for ${orderRefOf(session) ?? session.id}`,
        );
        break;
      }

      case "checkout.session.expired": {
        const session = event.data.object;
        const ref = orderRefOf(session);
        if (ref) await markStripeSessionExpired(ref);
        break;
      }

      default:
        // Everything else is noise for this integration.
        break;
    }
  } catch (err) {
    // Something went wrong on our side (database down, etc). Returning
    // 500 asks Stripe to retry, which is what we want — the payment
    // already happened and the order still needs settling.
    console.error(
      `[stripe-webhook] handler failed for ${event.type}:`,
      err instanceof Error ? err.message : err,
    );
    return Response.json({ error: "Handler failed." }, { status: 500 });
  }

  return ok();
}

/** The order ref travels in session metadata and client_reference_id. */
function orderRefOf(session: Stripe.Checkout.Session): string | null {
  return session.metadata?.order_ref ?? session.client_reference_id ?? null;
}

async function handleSessionPaid(
  session: Stripe.Checkout.Session,
): Promise<void> {
  const orderRef = orderRefOf(session);
  if (!orderRef) {
    console.error(
      `[stripe-webhook] session ${session.id} has no order ref — cannot settle.`,
    );
    return;
  }

  // `checkout.session.completed` also fires for payment methods that
  // settle asynchronously, where the money has not actually arrived yet.
  // Those resolve later via `async_payment_succeeded`.
  if (session.payment_status !== "paid") {
    console.info(
      `[stripe-webhook] ${orderRef}: session complete but payment_status=${session.payment_status}; waiting.`,
    );
    return;
  }

  // Read the order first so we can compare totals as part of the same
  // settle, rather than discovering a mismatch after the row already says
  // 'paid'. This should never differ — the session was built from the very
  // PricedOrder that produced these totals — but a silent mismatch is a
  // chargeback waiting to happen, so it gets recorded on the row.
  const existing = await findOrderByRef(orderRef);
  if (!existing) {
    console.error(
      `[stripe-webhook] ${orderRef}: no such order — payment ${session.id} is unattributed.`,
    );
    return;
  }

  const mismatch =
    session.amount_total !== null &&
    session.amount_total !== existing.total_cents
      ? session.amount_total - existing.total_cents
      : null;

  if (mismatch !== null) {
    console.error(
      `[stripe-webhook] ${orderRef}: AMOUNT MISMATCH — charged ${session.amount_total}, priced ${existing.total_cents}.`,
    );
  }

  const { transitioned, order } = await markOrderPaidByStripe({
    orderRef,
    sessionId: session.id,
    paymentIntentId: paymentIntentId(session),
    amountMismatchCents: mismatch,
    raw: session,
  });

  if (!transitioned) {
    // Either a redelivery of an event we already handled, or an order that
    // is no longer pending. Both are fine; neither should re-send email.
    console.info(`[stripe-webhook] ${orderRef}: already settled, ignoring.`);
    return;
  }

  if (!order) return;

  try {
    await sendOrderConfirmation({
      to: order.email,
      orderRef,
      items: order.items,
      subtotalCents: order.subtotal_cents,
      shippingCents: order.shipping_cents,
      totalCents: order.total_cents,
    });
  } catch (err) {
    // The money is in and the order is marked paid. A failed email is a
    // support task, not a reason to make Stripe retry the whole event.
    console.error(
      `[stripe-webhook] ${orderRef}: confirmation email failed:`,
      err instanceof Error ? err.message : err,
    );
  }
}
