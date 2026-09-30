"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart/store";
import { LineItem } from "./line-item";
import { OrderSummary, SummaryCtaLink } from "./order-summary";

export function CartContents() {
  const { items, subtotal, hydrated } = useCart();

  // Until rehydration completes we render a neutral skeleton that
  // matches the empty-state layout — avoids a flash of "Nothing queued"
  // for returning shoppers with a persisted cart.
  if (!hydrated) {
    return (
      <div
        className="mx-auto w-full max-w-[var(--content-max)] pad-x"
        style={{ paddingBottom: "clamp(3rem, 5vw, 5rem)" }}
      >
        <div
          className="border border-hairline bg-surface/30"
          style={{
            padding: "clamp(2rem, 4vw, 3rem)",
            minHeight: "12rem",
          }}
          aria-hidden
        />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div
        className="mx-auto w-full max-w-[var(--content-max)] pad-x"
        style={{ paddingBottom: "clamp(4rem, 7vw, 7rem)" }}
      >
        <div
          className="flex flex-col items-start gap-5 border border-hairline bg-surface/30"
          style={{ padding: "clamp(2rem, 4vw, 3.5rem)" }}
        >
          <div
            className="font-mono tracking-[0.3em] uppercase text-muted-foreground"
            style={{ fontSize: "clamp(9.5px, 0.25vw + 8.5px, 10.5px)" }}
          >
            Empty
          </div>
          <h2
            className="font-display leading-tight tracking-tight text-foreground"
            style={{ fontSize: "clamp(2rem, 4vw, 3.25rem)" }}
          >
            Nothing queued.
          </h2>
          <p
            className="max-w-md font-sans leading-relaxed text-muted-foreground"
            style={{ fontSize: "clamp(0.9rem, 0.3vw + 0.8rem, 1.05rem)" }}
          >
            Add a monograph from the catalog to start an order. Each vial is
            lot-traceable and ships with a signed Certificate of Analysis.
          </p>
          <Link
            href="/shop"
            className="group inline-flex items-center gap-3 border border-foreground bg-foreground px-5 py-3 font-mono tracking-[0.3em] uppercase text-background transition-colors hover:border-brand hover:bg-brand hover:text-brand-foreground"
            style={{ fontSize: "clamp(10px, 0.3vw + 9px, 11px)" }}
          >
            Browse the catalog
            <span aria-hidden className="transition-transform group-hover:translate-x-1">
              →
            </span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className="mx-auto w-full max-w-[var(--content-max)] pad-x"
      style={{ paddingBottom: "clamp(4rem, 7vw, 7rem)" }}
    >
      <div
        className="grid grid-cols-1 lg:grid-cols-[1fr_22rem]"
        style={{ columnGap: "clamp(2rem, 4vw, 4rem)", rowGap: "2.5rem" }}
      >
        {/* Line items */}
        <div className="border-t border-hairline">
          {items.map((item) => (
            <LineItem key={item.slug} item={item} />
          ))}
        </div>

        {/* Summary */}
        <OrderSummary
          subtotal={subtotal}
          cta={
            <SummaryCtaLink href="/checkout">
              Proceed to checkout
            </SummaryCtaLink>
          }
        />
      </div>
    </div>
  );
}
