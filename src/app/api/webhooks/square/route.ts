import type { NextRequest } from "next/server";
import { WebhooksHelper } from "square";
import {
  squareNotificationUrl,
  squareSignatureKey,
} from "@/lib/square/config";
import {
  findOrderBySquareOrderId,
  markOrderPaidBySquare,
} from "@/lib/orders";
import { sendOrderConfirmation } from "@/lib/email";

/**
 * POST /api/webhooks/square
 *
 * Where a Square card order actually becomes paid. As with Stripe, the
 * customer returning to the success page proves nothing — they may close
 * the tab — so fulfilment hangs off this endpoint alone.
 *
 * Signature verification uses Square's own helper rather than a
 * hand-rolled HMAC. Square signs the notification URL concatenated with
 * the raw body, and getting that concatenation subtly wrong would either
 * reject every real delivery or, worse, accept forged ones.
 *
 * The proxy matcher excludes /api, so the site-lock never shadows this.
 */

export const runtime = "nodejs";

export async function POST(request: NextRequest): Promise<Response> {
  const signatureKey = squareSignatureKey();
  const notificationUrl = squareNotificationUrl();

  if (!signatureKey || !notificationUrl) {
    console.error("[square-webhook] not configured — rejecting delivery.");
    // 503 so Square retries while the endpoint is misconfigured, rather
    // than dropping real payments on the floor.
    return Response.json({ error: "Not configured." }, { status: 503 });
  }

  const signature = request.headers.get("x-square-hmacsha256-signature");
  if (!signature) {
    return Response.json({ error: "Missing signature." }, { status: 400 });
  }

  // Raw bytes, exactly as signed. Parsing to JSON first and re-serialising
  // would change the string and invalidate the signature.
  const body = await request.text();

  let valid = false;
  try {
    valid = await WebhooksHelper.verifySignature({
      requestBody: body,
      signatureHeader: signature,
      signatureKey,
      notificationUrl,
    });
  } catch (err) {
    console.warn(
      "[square-webhook] signature check threw:",
      err instanceof Error ? err.message : err,
    );
  }

  if (!valid) {
    console.warn("[square-webhook] signature verification failed.");
    return Response.json({ error: "Invalid signature." }, { status: 400 });
  }

  let event: SquareEvent;
  try {
    event = JSON.parse(body) as SquareEvent;
  } catch {
    return Response.json({ error: "Invalid JSON." }, { status: 400 });
  }

  try {
    if (event.type === "payment.created" || event.type === "payment.updated") {
      await handlePayment(event);
    }
    // Everything else is noise for this integration.
  } catch (err) {
    console.error(
      `[square-webhook] handler failed for ${event.type}:`,
      err instanceof Error ? err.message : err,
    );
    // 500 asks Square to retry — the payment happened and the order still
    // needs settling.
    return Response.json({ error: "Handler failed." }, { status: 500 });
  }

  return Response.json({ received: true }, { status: 200 });
}

type SquarePayment = {
  id?: string;
  status?: string;
  order_id?: string;
  amount_money?: { amount?: number; currency?: string };
};

type SquareEvent = {
  type?: string;
  event_id?: string;
  data?: { type?: string; id?: string; object?: Record<string, unknown> };
};

/**
 * Square's docs describe `data.object` inconsistently — in places as the
 * payment itself, elsewhere as an object keyed by type. Accept both
 * rather than betting on one and silently dropping every payment.
 */
function extractPayment(event: SquareEvent): SquarePayment | null {
  const obj = event.data?.object;
  if (!obj) return null;
  const nested = (obj as { payment?: SquarePayment }).payment;
  const candidate = nested ?? (obj as SquarePayment);
  return candidate && typeof candidate === "object" ? candidate : null;
}

async function handlePayment(event: SquareEvent): Promise<void> {
  const payment = extractPayment(event);
  if (!payment?.id) {
    console.error("[square-webhook] event carried no payment object.");
    return;
  }

  // Only COMPLETED means funds are captured. APPROVED is an authorisation
  // that has not been taken yet, and settling on it would ship goods
  // against money that may never arrive.
  if (payment.status !== "COMPLETED") {
    console.info(
      `[square-webhook] payment ${payment.id} status=${payment.status}; waiting.`,
    );
    return;
  }

  const squareOrderId = payment.order_id;
  if (!squareOrderId) {
    console.error(
      `[square-webhook] payment ${payment.id} has no order_id — unattributable.`,
    );
    return;
  }

  const existing = await findOrderBySquareOrderId(squareOrderId);
  if (!existing) {
    console.error(
      `[square-webhook] no order for Square order ${squareOrderId} — payment ${payment.id} is unattributed.`,
    );
    return;
  }

  // Assert Square charged what we priced. Should never differ, since the
  // line items were built from the same PricedOrder — but a silent
  // mismatch is a chargeback waiting to happen.
  const charged = payment.amount_money?.amount;
  const mismatch =
    typeof charged === "number" && charged !== existing.total_cents
      ? charged - existing.total_cents
      : null;

  if (mismatch !== null) {
    console.error(
      `[square-webhook] ${existing.order_ref}: AMOUNT MISMATCH — charged ${charged}, priced ${existing.total_cents}.`,
    );
  }

  const { transitioned, order } = await markOrderPaidBySquare({
    squareOrderId,
    paymentId: payment.id,
    amountMismatchCents: mismatch,
    raw: event,
  });

  if (!transitioned) {
    // A redelivery, or an order already settled. Either is fine, and
    // neither should send a second confirmation.
    console.info(
      `[square-webhook] ${existing.order_ref}: already settled, ignoring.`,
    );
    return;
  }

  if (!order) return;

  try {
    await sendOrderConfirmation({
      to: order.email,
      orderRef: order.order_ref,
      items: order.items,
      subtotalCents: order.subtotal_cents,
      shippingCents: order.shipping_cents,
      totalCents: order.total_cents,
    });
  } catch (err) {
    // Money is in and the order is marked paid. A failed email is a
    // support task, not a reason to make Square retry the whole event.
    console.error(
      `[square-webhook] ${order.order_ref}: confirmation email failed:`,
      err instanceof Error ? err.message : err,
    );
  }
}
