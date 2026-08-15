import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import type { PricedLine } from "@/lib/pricing";
import type { CheckoutShipping } from "@/lib/checkout/types";
import type { PaymentMethod } from "@/lib/payment-methods";

/**
 * Order persistence.
 *
 * Orders are written before the card is charged, not after. If the gateway
 * call times out or the process dies mid-request, a 'pending' row still
 * exists to reconcile against the processor — whereas writing only on
 * success loses the record of every charge we failed to observe.
 */

export type OrderStatus =
  | "pending"
  | "paid"
  | "failed"
  | "shipped"
  | "cancelled"
  | "refunded";

export type OrderRow = {
  id: string;
  order_ref: string;
  user_id: string | null;
  email: string;
  status: OrderStatus;
  items: PricedLine[];
  shipping: CheckoutShipping;
  subtotal_cents: number;
  shipping_cents: number;
  total_cents: number;
  gateway: string | null;
  gateway_txn_id: string | null;
  gateway_auth_code: string | null;
  failure_reason: string | null;
  payment_method: PaymentMethod;
  payment_reference: string | null;
  stripe_session_id: string | null;
  stripe_payment_intent: string | null;
  amount_mismatch_cents: number | null;
  discount_code: string | null;
  discount_cents: number;
  marked_paid_by: string | null;
  marked_paid_at: string | null;
  created_at: string;
  updated_at: string;
};

/**
 * Human-facing reference, e.g. "PP-M8T2-K9QD".
 *
 * Time-prefixed so refs sort chronologically, with random suffix so two
 * orders placed in the same millisecond cannot collide.
 */
export function generateOrderRef(): string {
  const time = Date.now().toString(36).toUpperCase().slice(-4);
  const bytes = crypto.getRandomValues(new Uint8Array(3));
  const rand = Array.from(bytes)
    .map((b) => b.toString(36).toUpperCase().padStart(2, "0"))
    .join("")
    .slice(0, 4);
  return `PP-${time}-${rand}`;
}

export class OrdersUnavailableError extends Error {
  constructor() {
    super(
      "Order storage is not configured. Set SUPABASE_SERVICE_ROLE_KEY to persist orders.",
    );
    this.name = "OrdersUnavailableError";
  }
}

export type CreateOrderInput = {
  orderRef: string;
  userId: string | null;
  email: string;
  items: PricedLine[];
  shipping: CheckoutShipping;
  subtotalCents: number;
  shippingCents: number;
  totalCents: number;
  paymentMethod: PaymentMethod;
  /** Processor handling this order: 'stripe', 'nmi', or null for manual. */
  gateway: string | null;
  discountCents: number;
  discountCode: string | null;
};

/** Insert a 'pending' order. Throws if storage is unconfigured. */
export async function createPendingOrder(
  input: CreateOrderInput,
): Promise<OrderRow> {
  const supabase = createAdminClient();
  if (!supabase) throw new OrdersUnavailableError();

  const { data, error } = await supabase
    .from("orders")
    .insert({
      order_ref: input.orderRef,
      user_id: input.userId,
      email: input.email,
      status: "pending",
      items: input.items,
      shipping: input.shipping,
      subtotal_cents: input.subtotalCents,
      shipping_cents: input.shippingCents,
      total_cents: input.totalCents,
      payment_method: input.paymentMethod,
      gateway: input.gateway,
      discount_cents: input.discountCents,
      discount_code: input.discountCode,
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to record order: ${error.message}`);
  return data as OrderRow;
}

export async function markOrderPaid(
  orderRef: string,
  gateway: { transactionId: string; authCode: string; raw: unknown },
): Promise<void> {
  const supabase = createAdminClient();
  if (!supabase) throw new OrdersUnavailableError();

  const { error } = await supabase
    .from("orders")
    .update({
      status: "paid",
      gateway_txn_id: gateway.transactionId,
      gateway_auth_code: gateway.authCode,
      gateway_response: gateway.raw,
    })
    .eq("order_ref", orderRef);

  if (error) throw new Error(`Failed to mark order paid: ${error.message}`);
}

export async function markOrderFailed(
  orderRef: string,
  reason: string,
  raw?: unknown,
): Promise<void> {
  const supabase = createAdminClient();
  if (!supabase) throw new OrdersUnavailableError();

  const { error } = await supabase
    .from("orders")
    .update({
      status: "failed",
      failure_reason: reason,
      gateway_response: raw ?? null,
    })
    .eq("order_ref", orderRef);

  if (error) {
    // Best-effort: the customer already saw the decline. Log rather than
    // throw so we don't mask the original payment failure.
    console.error("[orders] could not mark order failed:", error.message);
  }
}

/**
 * Settle a fully comped order.
 *
 * No processor is involved — the total is zero, so there is nothing to
 * charge and nothing to wait for. Guarded on 'pending' like the Stripe
 * path so a double submit can't settle the same order twice, and the
 * boolean tells the caller whether to send the confirmation email.
 */
export async function markOrderComped(
  orderRef: string,
  code: string,
): Promise<{ transitioned: boolean }> {
  const supabase = createAdminClient();
  if (!supabase) throw new OrdersUnavailableError();

  const { data, error } = await supabase
    .from("orders")
    .update({
      status: "paid",
      payment_reference: `comp:${code}`,
      marked_paid_at: new Date().toISOString(),
      marked_paid_by: "system:comp-code",
    })
    .eq("order_ref", orderRef)
    .eq("status", "pending")
    .select("order_ref");

  if (error) throw new Error(`Failed to settle comped order: ${error.message}`);
  return { transitioned: Boolean(data && data.length > 0) };
}

/**
 * Record the Stripe session an order was handed off to.
 *
 * Written after the session exists but before the customer is redirected,
 * so a payment that completes can always be traced back to its order even
 * if the customer never returns to the success page.
 */
export async function attachStripeSession(
  orderRef: string,
  sessionId: string,
): Promise<void> {
  const supabase = createAdminClient();
  if (!supabase) throw new OrdersUnavailableError();

  const { error } = await supabase
    .from("orders")
    .update({ stripe_session_id: sessionId })
    .eq("order_ref", orderRef);

  if (error) {
    throw new Error(`Failed to attach Stripe session: ${error.message}`);
  }
}

export async function findOrderByStripeSession(
  sessionId: string,
): Promise<OrderRow | null> {
  const supabase = createAdminClient();
  if (!supabase) throw new OrdersUnavailableError();

  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("stripe_session_id", sessionId)
    .maybeSingle();

  if (error) throw new Error(`Failed to load order: ${error.message}`);
  return (data as OrderRow | null) ?? null;
}

/**
 * Settle a Stripe order from the webhook.
 *
 * Guarded on `status = 'pending'` and reports whether it actually moved
 * the row. Stripe redelivers webhooks — on its own retry schedule, and
 * again whenever someone replays an event from the dashboard — so this
 * has to be idempotent. The boolean is what stops the customer receiving
 * a fresh confirmation email on every redelivery.
 *
 * `amountMismatchCents` is set when Stripe's total disagreed with the
 * total we priced. That should be impossible; recording it is cheaper
 * than discovering it during a chargeback.
 */
export async function markOrderPaidByStripe(input: {
  orderRef: string;
  sessionId: string;
  paymentIntentId: string | null;
  amountMismatchCents?: number | null;
  raw: unknown;
}): Promise<{ transitioned: boolean; order: OrderRow | null }> {
  const supabase = createAdminClient();
  if (!supabase) throw new OrdersUnavailableError();

  const { data, error } = await supabase
    .from("orders")
    .update({
      status: "paid",
      gateway: "stripe",
      stripe_session_id: input.sessionId,
      stripe_payment_intent: input.paymentIntentId,
      gateway_txn_id: input.paymentIntentId,
      gateway_response: input.raw,
      amount_mismatch_cents: input.amountMismatchCents ?? null,
    })
    .eq("order_ref", input.orderRef)
    .eq("status", "pending")
    .select("*");

  if (error) throw new Error(`Failed to mark order paid: ${error.message}`);

  const rows = (data ?? []) as OrderRow[];
  return { transitioned: rows.length > 0, order: rows[0] ?? null };
}

export async function findOrderByRef(orderRef: string): Promise<OrderRow | null> {
  const supabase = createAdminClient();
  if (!supabase) throw new OrdersUnavailableError();

  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("order_ref", orderRef)
    .maybeSingle();

  if (error) throw new Error(`Failed to load order: ${error.message}`);
  return (data as OrderRow | null) ?? null;
}

/**
 * Abandon a pending Stripe order whose session expired.
 *
 * Also guarded on 'pending': an expired-session event can arrive after a
 * successful payment in edge cases, and it must never undo a paid order.
 */
export async function markStripeSessionExpired(
  orderRef: string,
): Promise<void> {
  const supabase = createAdminClient();
  if (!supabase) throw new OrdersUnavailableError();

  const { error } = await supabase
    .from("orders")
    .update({
      status: "cancelled",
      failure_reason: "Stripe checkout session expired before payment.",
    })
    .eq("order_ref", orderRef)
    .eq("status", "pending");

  if (error) {
    console.error("[orders] could not expire order:", error.message);
  }
}

/**
 * Reconcile a manual (bank transfer / crypto) order once funds arrive.
 *
 * Guarded on `status = 'pending'` so a double-click or a stale tab cannot
 * re-mark an order that was already settled or cancelled — the update
 * silently matches zero rows instead, and we report that back.
 */
export async function markOrderPaidManually(input: {
  orderRef: string;
  reference: string | null;
  by: string;
}): Promise<{ ok: boolean; reason?: string }> {
  const supabase = createAdminClient();
  if (!supabase) throw new OrdersUnavailableError();

  const { data, error } = await supabase
    .from("orders")
    .update({
      status: "paid",
      payment_reference: input.reference,
      marked_paid_by: input.by,
      marked_paid_at: new Date().toISOString(),
    })
    .eq("order_ref", input.orderRef)
    .eq("status", "pending")
    .neq("payment_method", "card")
    .select("order_ref");

  if (error) return { ok: false, reason: error.message };
  if (!data || data.length === 0) {
    return {
      ok: false,
      reason: "Order was not pending — it may already have been marked paid.",
    };
  }
  return { ok: true };
}

/** Admin dashboard listing, newest first. */
export async function listOrders(limit = 100): Promise<OrderRow[]> {
  const supabase = createAdminClient();
  if (!supabase) throw new OrdersUnavailableError();

  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(`Failed to load orders: ${error.message}`);
  return (data ?? []) as OrderRow[];
}

export async function updateOrderStatus(
  orderRef: string,
  status: OrderStatus,
): Promise<void> {
  const supabase = createAdminClient();
  if (!supabase) throw new OrdersUnavailableError();

  const { error } = await supabase
    .from("orders")
    .update({ status })
    .eq("order_ref", orderRef);

  if (error) throw new Error(`Failed to update status: ${error.message}`);
}
