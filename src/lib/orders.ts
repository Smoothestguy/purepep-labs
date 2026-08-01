import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import type { PricedLine } from "@/lib/pricing";
import type { CheckoutShipping } from "@/lib/nmi/types";
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
      gateway: input.paymentMethod === "card" ? "nmi" : null,
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
