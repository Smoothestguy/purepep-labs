"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart/store";
import { useSignedIn } from "@/components/shared/auth-provider";
import { LineItem } from "./line-item";
import { OrderSummary, SummaryCtaLink } from "./order-summary";

export function CartContents() {
  const { items, subtotal, hydrated } = useCart();
  const { signedIn, loading: sessionLoading } = useSignedIn();

  // Until rehydration completes we render a neutral skeleton that
  // matches the empty-state layout — avoids a flash of "Nothing queued"
  // for returning shoppers with a persisted cart. The session lookup is
  // folded into the same wait so prices never flash before the gate.
  if (!hydrated || sessionLoading) {
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

  // The cart is persisted in localStorage and outlives a sign-out, so the
  // price gate has to hold here too — otherwise signing out and returning
  // to /cart would still show every line total.
  if (!signedIn) {
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
            className="font-mono tracking-[0.3em] uppercase text-brand"
            style={{ fontSize: "clamp(9.5px, 0.25vw + 8.5px, 10.5px)" }}
          >
            Researcher account required
          </div>
          <h2
            className="font-display leading-tight tracking-tight text-foreground"
            style={{ fontSize: "clamp(2rem, 4vw, 3.25rem)" }}
          >
            Sign in to review.
          </h2>
          <p
            className="max-w-md font-sans leading-relaxed text-muted-foreground"
            style={{ fontSize: "clamp(0.9rem, 0.3vw + 0.8rem, 1.05rem)" }}
          >
            Pricing and ordering are restricted to registered researchers.
            {items.length > 0
              ? " Your cart is saved — sign in and it'll be exactly as you left it."
              : ""}
          </p>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <Link
              href={`/login?redirect=${encodeURIComponent("/cart")}`}
              className="group inline-flex items-center gap-3 whitespace-nowrap bg-brand px-5 py-3 font-mono tracking-[0.3em] uppercase text-brand-foreground transition-all hover:shadow-[0_0_0_4px_oklch(0.82_0.15_210_/_0.18)]"
              style={{ fontSize: "clamp(10px, 0.3vw + 9px, 11px)" }}
            >
              Sign in
              <span aria-hidden className="transition-transform group-hover:translate-x-1">
                →
              </span>
            </Link>
            <Link
              href="/shop"
              className="inline-flex items-center gap-3 whitespace-nowrap border border-hairline px-5 py-3 font-mono tracking-[0.3em] uppercase text-foreground transition-colors hover:border-foreground"
              style={{ fontSize: "clamp(10px, 0.3vw + 9px, 11px)" }}
            >
              Browse catalog
            </Link>
          </div>
        </div>
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
