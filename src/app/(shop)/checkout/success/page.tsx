import type { Metadata } from "next";
import Link from "next/link";
import { orderForReceipt, type ReceiptOrder } from "@/lib/orders";
import { retrieveSession } from "@/lib/stripe/checkout";
import { ClearCart } from "./clear-cart";
import { RefreshWhilePending } from "./refresh-while-pending";

export const metadata: Metadata = {
  title: "Thank you for your order — The Pure Pep",
  description: "Your order confirmation from The Pure Pep.",
};

type SearchParams = Promise<{
  order?: string | string[];
  awaiting?: string | string[];
  session_id?: string | string[];
}>;

function first(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

/**
 * What the customer is looking at.
 *
 *   paid       — money is in, per our own order record (or Stripe)
 *   confirming — they paid on Square's page; its webhook hasn't landed yet
 *   awaiting   — manual method; we're waiting on a transfer
 *   received   — order exists but we can't show its details (signed out)
 *   failed     — the payment did not go through
 *   expired    — the Stripe session lapsed without payment
 */
type ReceiptState =
  | "paid"
  | "confirming"
  | "awaiting"
  | "received"
  | "failed"
  | "expired";

/**
 * The order is read from the database as the signed-in customer, so the
 * status shown is what we actually recorded — landing on this URL is not
 * evidence of payment, and the order ref in it is user-supplied. Someone
 * else's ref returns nothing and gets the generic thank-you.
 */
export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const resolved = await searchParams;
  const sessionId = first(resolved.session_id);
  const awaitingParam = first(resolved.awaiting) === "1";

  let ref = first(resolved.order);
  let stripeState: ReceiptState | null = null;

  if (sessionId) {
    const session = await retrieveSession(sessionId);
    const sessionRef = session?.metadata?.order_ref ?? session?.client_reference_id;
    if (sessionRef) ref = sessionRef;
    if (!session) stripeState = "confirming";
    else if (session.status === "expired") stripeState = "expired";
    else if (session.payment_status === "paid") stripeState = "paid";
    else stripeState = "confirming";
  }

  const order = ref ? await orderForReceipt(ref) : null;
  const state = resolveState(order, stripeState, awaitingParam);
  const orderRef = order?.ref ?? ref ?? null;

  // The cart only survives when no order was actually placed.
  const orderPlaced = state !== "expired" && state !== "failed";
  const comped = order ? order.totalCents === 0 : false;
  const firstName = order?.shipping?.firstName?.trim();

  return (
    <>
      {orderPlaced ? <ClearCart /> : null}
      {state === "confirming" ? <RefreshWhilePending /> : null}

      <section className="relative border-b border-hairline">
        <div
          className="mx-auto w-full max-w-[var(--content-max)] pad-x"
          style={{
            paddingTop: "clamp(2.5rem, 6vw, 6rem)",
            paddingBottom: "clamp(3.5rem, 7vw, 7rem)",
          }}
        >
          <div className="mx-auto max-w-2xl">
            <StatusMark state={state} />

            <h1
              className="font-display leading-[0.98] tracking-[-0.02em]"
              style={{
                marginTop: "clamp(1.25rem, 2vw, 1.75rem)",
                fontSize: "clamp(2.4rem, 6vw, 4.5rem)",
              }}
            >
              {headline(state, firstName)}
            </h1>

            <p
              className="font-sans leading-relaxed text-muted-foreground"
              style={{
                marginTop: "clamp(0.9rem, 1.5vw, 1.25rem)",
                fontSize: "clamp(1rem, 0.4vw + 0.9rem, 1.15rem)",
              }}
            >
              {lede(state, order, comped)}
            </p>

            {/* Payment + reference */}
            <dl
              className="grid grid-cols-1 gap-px border border-hairline bg-hairline sm:grid-cols-2"
              style={{ marginTop: "clamp(1.75rem, 3vw, 2.5rem)" }}
            >
              <Cell label="Order number">
                <span className="font-mono tracking-[0.12em] text-foreground">
                  {orderRef ?? "—"}
                </span>
              </Cell>
              <Cell label="Payment">
                <PaymentLine state={state} order={order} comped={comped} />
              </Cell>
            </dl>

            {order ? <Summary order={order} /> : null}
            {order ? <ShipTo order={order} /> : null}

            {orderPlaced ? (
              <div
                className="border border-hairline bg-surface/40"
                style={{
                  marginTop: "clamp(1.25rem, 2vw, 1.75rem)",
                  padding: "clamp(1.1rem, 2vw, 1.5rem)",
                }}
              >
                <div
                  className="font-mono tracking-[0.25em] uppercase text-muted-foreground"
                  style={{ fontSize: "clamp(9.5px, 0.25vw + 8.5px, 10.5px)" }}
                >
                  What happens next
                </div>
                <ol
                  className="mt-3 flex flex-col gap-2.5 font-sans leading-relaxed text-foreground"
                  style={{ fontSize: "clamp(0.9rem, 0.3vw + 0.82rem, 1rem)" }}
                >
                  {state === "awaiting" ? (
                    <li>
                      <span className="text-brand">1.</span> Send payment using the
                      instructions we email you, quoting{" "}
                      <strong>{orderRef}</strong>.
                    </li>
                  ) : null}
                  <li>
                    <span className="text-brand">{state === "awaiting" ? "2." : "1."}</span>{" "}
                    We pack your order and ship it within one business day
                    {state === "awaiting" ? " of payment clearing" : ""}.
                  </li>
                  <li>
                    <span className="text-brand">{state === "awaiting" ? "3." : "2."}</span>{" "}
                    Questions? Email{" "}
                    <a href="mailto:support@thepurepep.com" className="text-brand hover:underline">
                      support@thepurepep.com
                    </a>{" "}
                    with your order number.
                  </li>
                </ol>
              </div>
            ) : null}

            <div
              className="flex flex-col sm:flex-row"
              style={{
                marginTop: "clamp(1.75rem, 3vw, 2.5rem)",
                gap: "clamp(0.65rem, 1.2vw, 1rem)",
              }}
            >
              <Link
                href={orderPlaced ? "/shop" : "/cart"}
                className="group inline-flex items-center justify-center gap-3 whitespace-nowrap bg-brand px-5 py-3.5 font-mono tracking-[0.3em] uppercase text-brand-foreground transition-all hover:shadow-[0_0_0_4px_oklch(0.82_0.15_210_/_0.18)]"
                style={{ fontSize: "clamp(10px, 0.3vw + 9px, 11px)" }}
              >
                {orderPlaced ? "Continue shopping" : "Return to cart"}
                <span aria-hidden className="transition-transform group-hover:translate-x-1">
                  →
                </span>
              </Link>
              <Link
                href="/coa"
                className="inline-flex items-center justify-center gap-3 whitespace-nowrap border border-hairline px-5 py-3.5 font-mono tracking-[0.3em] uppercase text-foreground transition-colors hover:border-foreground"
                style={{ fontSize: "clamp(10px, 0.3vw + 9px, 11px)" }}
              >
                View certificates
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function resolveState(
  order: ReceiptOrder | null,
  stripeState: ReceiptState | null,
  awaitingParam: boolean,
): ReceiptState {
  if (stripeState === "expired") return "expired";
  if (order) {
    switch (order.status) {
      case "paid":
      case "shipped":
        return "paid";
      case "failed":
      case "cancelled":
      case "refunded":
        return "failed";
      case "pending":
        return order.paymentMethod && order.paymentMethod !== "card"
          ? "awaiting"
          : "confirming";
    }
  }
  if (stripeState) return stripeState;
  return awaitingParam ? "awaiting" : "received";
}

function headline(state: ReceiptState, firstName?: string) {
  const name = firstName ? `, ${firstName}` : "";
  switch (state) {
    case "paid":
    case "received":
      return (
        <>
          Thank you{name}.{" "}
          <span className="italic text-gradient-brand">Your order is in.</span>
        </>
      );
    case "confirming":
      return (
        <>
          Thank you{name}.{" "}
          <span className="italic text-gradient-brand">Confirming your payment…</span>
        </>
      );
    case "awaiting":
      return (
        <>
          Thank you{name}.{" "}
          <span className="italic text-gradient-brand">Your order is reserved.</span>
        </>
      );
    case "failed":
      return "Your payment didn't go through.";
    case "expired":
      return "Your checkout timed out.";
  }
}

function lede(state: ReceiptState, order: ReceiptOrder | null, comped: boolean) {
  const total = order ? usd(order.totalCents) : null;
  switch (state) {
    case "paid":
      if (comped) return "Your order is confirmed at no charge. We'll get it packed and on its way.";
      // The Square/Stripe webhook emails a confirmation when it marks the
      // order paid, so by the time this state shows, it has been sent.
      return total
        ? `We've received your payment of ${total} and your order is confirmed. A confirmation is on its way to ${order?.email ?? "your inbox"}.`
        : "We've received your payment and your order is confirmed. A confirmation is on its way to your inbox.";
    case "confirming":
      return "Square is confirming your payment — this usually takes a few seconds and this page updates on its own. There's no need to pay again.";
    case "awaiting":
      return total
        ? `Your order is held for you. It ships once your payment of ${total} clears.`
        : "Your order is held for you and ships once your payment clears.";
    case "received":
      return "Your order has been received. Sign in to see its full details.";
    case "failed":
      return "Nothing was charged. Your cart is still saved — you can try again whenever you're ready.";
    case "expired":
      return "The payment page timed out before payment completed, so nothing was charged. Your cart is still saved.";
  }
}

function StatusMark({ state }: { state: ReceiptState }) {
  const ok = state === "paid" || state === "received";
  const waiting = state === "confirming" || state === "awaiting";
  const bad = state === "failed" || state === "expired";
  return (
    <div className="flex items-center gap-3">
      <span
        aria-hidden
        className={`grid size-11 place-items-center rounded-full border text-lg ${
          bad
            ? "border-heat/50 bg-heat/10 text-heat"
            : "border-brand/50 bg-brand/10 text-brand"
        } ${state === "confirming" ? "animate-pulse" : ""}`}
      >
        {ok ? "✓" : waiting ? "…" : "!"}
      </span>
      <span
        className={`font-mono tracking-[0.3em] uppercase ${bad ? "text-heat" : "text-brand"}`}
        style={{ fontSize: "clamp(10px, 0.3vw + 9px, 11px)" }}
      >
        {
          {
            paid: "Order confirmed",
            received: "Order received",
            confirming: "Confirming payment",
            awaiting: "Awaiting payment",
            failed: "Payment failed",
            expired: "Checkout expired",
          }[state]
        }
      </span>
    </div>
  );
}

function PaymentLine({
  state,
  order,
  comped,
}: {
  state: ReceiptState;
  order: ReceiptOrder | null;
  comped: boolean;
}) {
  const total = order ? usd(order.totalCents) : null;
  if (state === "paid") {
    if (comped) return <span className="text-brand">No charge · code {order?.discountCode}</span>;
    return <span className="text-brand">✓ {total ? `${total} paid` : "Paid"}</span>;
  }
  if (state === "confirming") return <span className="text-foreground">Confirming{total ? ` · ${total}` : ""}</span>;
  if (state === "awaiting") return <span className="text-foreground">Awaiting{total ? ` · ${total} due` : ""}</span>;
  if (state === "failed" || state === "expired") return <span className="text-heat">Not charged</span>;
  return <span className="text-foreground">Received</span>;
}

function Summary({ order }: { order: ReceiptOrder }) {
  const rows: Array<{ k: string; v: string; accent?: boolean }> = [
    { k: "Subtotal", v: usd(order.subtotalCents) },
    { k: "Shipping", v: order.shippingCents === 0 ? "Free" : usd(order.shippingCents) },
  ];
  if (order.discountCents > 0) {
    rows.push({
      k: `Discount${order.discountCode ? ` · ${order.discountCode}` : ""}`,
      v: `−${usd(order.discountCents)}`,
      accent: true,
    });
  }
  return (
    <div
      className="border border-hairline"
      style={{ marginTop: "clamp(1.25rem, 2vw, 1.75rem)", padding: "clamp(1.1rem, 2vw, 1.5rem)" }}
    >
      <div
        className="font-mono tracking-[0.25em] uppercase text-muted-foreground"
        style={{ fontSize: "clamp(9.5px, 0.25vw + 8.5px, 10.5px)" }}
      >
        Your order
      </div>
      <ul className="mt-3 divide-y divide-hairline">
        {order.items.map((i, idx) => (
          <li key={`${i.name}-${i.dose}-${idx}`} className="flex items-baseline justify-between gap-4 py-2.5">
            <span className="min-w-0 font-sans text-foreground" style={{ fontSize: "clamp(0.92rem, 0.3vw + 0.85rem, 1rem)" }}>
              {i.name} <span className="text-muted-foreground">{i.dose}</span>
              {i.quantity > 1 ? <span className="text-muted-foreground"> × {i.quantity}</span> : null}
            </span>
            <span className="shrink-0 font-mono text-foreground" style={{ fontSize: "clamp(11.5px, 0.3vw + 10.5px, 13px)" }}>
              {usd(i.lineCents)}
            </span>
          </li>
        ))}
      </ul>
      <dl
        className="mt-2 flex flex-col gap-1.5 border-t border-hairline pt-3 font-mono"
        style={{ fontSize: "clamp(11px, 0.3vw + 10px, 12.5px)" }}
      >
        {rows.map((r) => (
          <div key={r.k} className="flex justify-between gap-4">
            <dt className="uppercase tracking-[0.18em] text-muted-foreground">{r.k}</dt>
            <dd className={r.accent ? "text-brand" : "text-foreground"}>{r.v}</dd>
          </div>
        ))}
        <div className="mt-1.5 flex items-baseline justify-between gap-4 border-t border-hairline pt-3">
          <dt className="uppercase tracking-[0.18em] text-foreground">Total</dt>
          <dd className="font-display text-foreground" style={{ fontSize: "clamp(1.4rem, 2.5vw, 1.75rem)" }}>
            {usd(order.totalCents)}
          </dd>
        </div>
      </dl>
    </div>
  );
}

function ShipTo({ order }: { order: ReceiptOrder }) {
  const s = order.shipping;
  if (!s?.address1) return null;
  return (
    <div
      className="grid grid-cols-1 gap-px border border-hairline bg-hairline sm:grid-cols-2"
      style={{ marginTop: "clamp(1.25rem, 2vw, 1.75rem)" }}
    >
      <Cell label="Shipping to">
        <span className="font-sans leading-relaxed text-foreground">
          {s.firstName} {s.lastName}
          <br />
          {s.address1}
          {s.address2 ? (
            <>
              <br />
              {s.address2}
            </>
          ) : null}
          <br />
          {s.city}, {s.state} {s.zip}
        </span>
      </Cell>
      <Cell label="Contact">
        <span className="font-sans leading-relaxed text-foreground break-all">
          {order.email}
          {s.phone ? (
            <>
              <br />
              {s.phone}
            </>
          ) : null}
        </span>
      </Cell>
    </div>
  );
}

function Cell({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="bg-background" style={{ padding: "clamp(0.9rem, 1.6vw, 1.2rem)" }}>
      <dt
        className="font-mono tracking-[0.25em] uppercase text-muted-foreground"
        style={{ fontSize: "clamp(9px, 0.25vw + 8px, 10px)" }}
      >
        {label}
      </dt>
      <dd className="mt-1.5" style={{ fontSize: "clamp(0.9rem, 0.3vw + 0.82rem, 1rem)" }}>
        {children}
      </dd>
    </div>
  );
}

function usd(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}
