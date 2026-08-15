import type { Metadata } from "next";
import Link from "next/link";
import { retrieveSession } from "@/lib/stripe/checkout";
import { ClearCart } from "./clear-cart";

export const metadata: Metadata = {
  title: "Order received — The Pure Pep",
  description: "Receipt and dispatch confirmation for your order from The Pure Pep.",
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
 *   confirmed  — money is in (NMI inline sale, or a settled Stripe session)
 *   processing — Stripe session complete but the payment hasn't settled
 *   awaiting   — manual method; we're waiting on a transfer
 *   expired    — the Stripe session lapsed without payment
 */
type ReceiptState = "confirmed" | "processing" | "awaiting" | "expired";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const resolved = await searchParams;
  const sessionId = first(resolved.session_id);
  const awaitingPayment = first(resolved.awaiting) === "1";

  let orderId = first(resolved.order) ?? "UNKNOWN";
  let state: ReceiptState = awaitingPayment ? "awaiting" : "confirmed";

  // With a Stripe session we ask Stripe what happened rather than trusting
  // the query string — landing on this URL is not evidence of payment, and
  // the order ref in it is user-supplied. The session id is unguessable,
  // so the ref we read back off the session is the trustworthy one.
  if (sessionId) {
    const session = await retrieveSession(sessionId);
    const ref = session?.metadata?.order_ref ?? session?.client_reference_id;
    if (ref) orderId = ref;

    if (!session) {
      state = "processing";
    } else if (session.status === "expired") {
      state = "expired";
    } else if (session.payment_status === "paid") {
      state = "confirmed";
    } else {
      state = "processing";
    }
  }

  // An expired session was never paid, so the cart must survive it.
  const orderPlaced = state !== "expired";

  const banner = BANNERS[state];

  return (
    <>
      {orderPlaced ? <ClearCart /> : null}

      {banner ? (
        <div className={`border-b ${banner.className}`}>
          <div
            className="mx-auto flex max-w-[var(--content-max)] items-center gap-3 pad-x py-3 font-mono tracking-[0.25em] uppercase"
            style={{ fontSize: "clamp(10px, 0.3vw + 9px, 11px)" }}
          >
            <span aria-hidden className={`size-1.5 rounded-full ${banner.dot}`} />
            {banner.label}
          </div>
        </div>
      ) : null}

      <section className="relative border-b border-hairline">
        <div
          className="mx-auto w-full max-w-[var(--content-max)] pad-x"
          style={{
            paddingTop: "clamp(3.5rem, 7vw, 8rem)",
            paddingBottom: "clamp(4rem, 7vw, 7rem)",
          }}
        >
          <div className="section-eyebrow">
            <span className="whitespace-nowrap text-brand">§ 11</span>
            <span
              className="h-px shrink-0 bg-hairline"
              style={{ width: "clamp(1.5rem, 3vw, 2.75rem)" }}
            />
            <span>Receipt</span>
          </div>

          <h1
            className="display-hero"
            style={{ marginTop: "clamp(1rem, 1.5vw, 1.5rem)" }}
          >
            {HEADLINES[state]}
          </h1>

          <div
            className="flex flex-col border-t border-hairline"
            style={{
              marginTop: "clamp(2rem, 3.5vw, 3rem)",
              paddingTop: "clamp(1.25rem, 2vw, 1.75rem)",
              gap: "clamp(0.85rem, 1.2vw, 1rem)",
            }}
          >
            <div
              className="flex items-baseline justify-between gap-4 font-mono tracking-[0.22em] uppercase"
              style={{ fontSize: "clamp(10px, 0.3vw + 9px, 11px)" }}
            >
              <span className="text-muted-foreground">Order ID</span>
              <span className="text-foreground">{orderId}</span>
            </div>
            <div
              className="flex items-baseline justify-between gap-4 font-mono tracking-[0.22em] uppercase"
              style={{ fontSize: "clamp(10px, 0.3vw + 9px, 11px)" }}
            >
              <span className="text-muted-foreground">Status</span>
              <span className={state === "expired" ? "text-heat" : "text-brand"}>
                {STATUS_LABELS[state]}
              </span>
            </div>
          </div>

          <p
            className="body-lede max-w-xl"
            style={{ marginTop: "clamp(1.5rem, 2.5vw, 2rem)" }}
          >
            <Body state={state} orderId={orderId} />
          </p>

          <div
            className="flex flex-wrap items-center"
            style={{
              marginTop: "clamp(2rem, 3vw, 2.75rem)",
              gap: "clamp(0.65rem, 1.2vw, 1rem)",
            }}
          >
            <Link
              href={state === "expired" ? "/cart" : "/shop"}
              className="group inline-flex items-center gap-3 whitespace-nowrap border border-foreground bg-foreground px-5 py-3 font-mono tracking-[0.3em] uppercase text-background transition-colors hover:border-brand hover:bg-brand hover:text-brand-foreground"
              style={{ fontSize: "clamp(10px, 0.3vw + 9px, 11px)" }}
            >
              {state === "expired" ? "Return to cart" : "Back to catalog"}
              <span aria-hidden className="transition-transform group-hover:translate-x-1">
                →
              </span>
            </Link>
            <Link
              href="/coa"
              className="inline-flex items-center gap-3 whitespace-nowrap border border-hairline px-5 py-3 font-mono tracking-[0.3em] uppercase text-foreground transition-colors hover:border-foreground"
              style={{ fontSize: "clamp(10px, 0.3vw + 9px, 11px)" }}
            >
              <span className="size-1.5 rounded-full bg-brand" />
              View CoA archive
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

const HEADLINES: Record<ReceiptState, string> = {
  confirmed: "Lodged.",
  processing: "Received.",
  awaiting: "Reserved.",
  expired: "Lapsed.",
};

const STATUS_LABELS: Record<ReceiptState, string> = {
  confirmed: "Confirmed",
  processing: "Processing payment",
  awaiting: "Awaiting payment",
  expired: "Session expired",
};

const BANNERS: Record<
  ReceiptState,
  { label: string; className: string; dot: string } | null
> = {
  confirmed: null,
  processing: {
    label: "Payment processing — we'll email your receipt on confirmation",
    className: "border-brand/40 bg-brand/10 text-brand",
    dot: "bg-brand",
  },
  awaiting: {
    label: "Awaiting payment — check your email for instructions",
    className: "border-brand/40 bg-brand/10 text-brand",
    dot: "bg-brand",
  },
  expired: {
    label: "Checkout session expired — no payment was taken",
    className: "border-heat/40 bg-heat/10 text-heat",
    dot: "bg-heat",
  },
};

function Body({ state, orderId }: { state: ReceiptState; orderId: string }) {
  if (state === "awaiting") {
    return (
      <>
        We&rsquo;ve emailed payment instructions along with the amount due.
        Quote <strong className="text-foreground">{orderId}</strong> as your
        reference so we can match the payment to this order. We dispatch
        cold-chain as soon as funds clear, with a third-party-signed
        Certificate of Analysis in every shipment.
      </>
    );
  }

  if (state === "processing") {
    return (
      <>
        Your payment is still settling with the processor — this is normal and
        usually takes a moment. We&rsquo;ll email a confirmation to you the
        instant it clears, and dispatch cold-chain from there. No further
        action is needed on your side; quote{" "}
        <strong className="text-foreground">{orderId}</strong> if you get in
        touch.
      </>
    );
  }

  if (state === "expired") {
    return (
      <>
        This checkout session timed out before payment completed, so nothing
        was charged and no order was placed. Your cart is still intact —
        return to it and check out again whenever you&rsquo;re ready.
      </>
    );
  }

  return (
    <>
      A confirmation is on its way to your inbox. Every lot ships cold-chain
      within one business day, accompanied by a third-party-signed Certificate
      of Analysis.
    </>
  );
}
