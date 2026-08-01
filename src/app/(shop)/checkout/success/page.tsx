import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Order received — The Pure Pep",
  description: "Receipt and dispatch confirmation for your order from The Pure Pep.",
};

type SearchParams = Promise<{
  order?: string | string[];
  awaiting?: string | string[];
}>;

function first(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const resolved = await searchParams;
  const orderId = first(resolved.order) ?? "UNKNOWN";
  // Manual payment: order recorded, funds not yet received.
  const awaitingPayment = first(resolved.awaiting) === "1";

  return (
    <>
      {awaitingPayment ? (
        <div className="border-b border-brand/40 bg-brand/10">
          <div
            className="mx-auto flex max-w-[var(--content-max)] items-center gap-3 pad-x py-3 font-mono tracking-[0.25em] uppercase text-brand"
            style={{ fontSize: "clamp(10px, 0.3vw + 9px, 11px)" }}
          >
            <span aria-hidden className="size-1.5 rounded-full bg-brand" />
            Awaiting payment — check your email for instructions
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
            {awaitingPayment ? "Reserved." : "Lodged."}
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
              <span className="text-brand">
                {awaitingPayment ? "Awaiting payment" : "Confirmed"}
              </span>
            </div>
          </div>

          <p
            className="body-lede max-w-xl"
            style={{ marginTop: "clamp(1.5rem, 2.5vw, 2rem)" }}
          >
            {awaitingPayment ? (
              <>
                We&rsquo;ve emailed payment instructions along with the amount
                due. Quote <strong className="text-foreground">{orderId}</strong>{" "}
                as your reference so we can match the payment to this order. We
                dispatch cold-chain as soon as funds clear, with a
                third-party-signed Certificate of Analysis in every shipment.
              </>
            ) : (
              <>
                A confirmation is on its way to your inbox. Every lot ships
                cold-chain within one business day, accompanied by a
                third-party-signed Certificate of Analysis.
              </>
            )}
          </p>

          <div
            className="flex flex-wrap items-center"
            style={{
              marginTop: "clamp(2rem, 3vw, 2.75rem)",
              gap: "clamp(0.65rem, 1.2vw, 1rem)",
            }}
          >
            <Link
              href="/shop"
              className="group inline-flex items-center gap-3 whitespace-nowrap border border-foreground bg-foreground px-5 py-3 font-mono tracking-[0.3em] uppercase text-background transition-colors hover:border-brand hover:bg-brand hover:text-brand-foreground"
              style={{ fontSize: "clamp(10px, 0.3vw + 9px, 11px)" }}
            >
              Back to catalog
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
