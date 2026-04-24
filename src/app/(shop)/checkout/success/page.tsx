import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Order received — PurePep Labs",
  description: "Receipt and dispatch confirmation for your PurePep order.",
};

type SearchParams = Promise<{
  order?: string | string[];
}>;

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const resolved = await searchParams;
  const raw = Array.isArray(resolved.order) ? resolved.order[0] : resolved.order;
  const orderId = raw ?? "UNKNOWN";

  return (
    <>
      {/* Heat banner — matches the pattern Agent E uses on legal pages */}
      <div className="border-b border-heat/40 bg-heat/10 text-heat-foreground">
        <div
          className="mx-auto flex max-w-[var(--content-max)] items-center gap-3 pad-x py-3 font-mono tracking-[0.25em] uppercase text-heat"
          style={{ fontSize: "clamp(10px, 0.3vw + 9px, 11px)" }}
        >
          <span aria-hidden className="size-1.5 rounded-full bg-heat" />
          [Mock approval — NMI gateway not wired in Phase 2]
        </div>
      </div>

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
            Lodged.
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
              <span className="text-brand">Mock approval</span>
            </div>
          </div>

          <p
            className="body-lede max-w-xl"
            style={{ marginTop: "clamp(1.5rem, 2.5vw, 2rem)" }}
          >
            A confirmation is on its way to your inbox. Every lot ships
            cold-chain within one business day, accompanied by a
            third-party-signed Certificate of Analysis.
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
