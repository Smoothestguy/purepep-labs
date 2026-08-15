"use client";

import Link from "next/link";
import { useSignedIn } from "@/components/shared/auth-provider";

/**
 * Price visibility gate.
 *
 * Prices are shown to signed-in researchers only. The catalog itself stays
 * public — monographs, sequences, purity and CoAs are all still indexable
 * — but what a vial costs requires an account.
 *
 * Deliberately applied on the marketing pages too, not just /shop. A gate
 * that leaves the same prices rendered on the homepage isn't a gate.
 *
 * Note this hides prices in the UI; it is not a secrecy mechanism. The
 * catalog ships inside the client bundle, so treat it as a product
 * decision about what's on display, not a way to keep numbers
 * confidential from anyone determined to read them.
 */
export function usePriceVisibility(): { visible: boolean; loading: boolean } {
  const { signedIn, loading } = useSignedIn();
  return { visible: signedIn, loading };
}

type LockedPriceProps = {
  /** Match the surrounding type scale. */
  fontSize?: string;
  /** Where to send the customer; they return here after signing in. */
  next?: string;
  /**
   * Render as a link. Must be false anywhere the gate sits inside an
   * existing `<Link>` — nested anchors are invalid HTML and browsers
   * recover from them unpredictably.
   */
  interactive?: boolean;
  className?: string;
};

/**
 * The stand-in shown where a price would be.
 *
 * Rendered as a link where it can be, so the gate reads as an invitation
 * rather than a dead end — a bare "hidden" label looks like a bug.
 */
export function LockedPrice({
  fontSize = "clamp(10px, 0.3vw + 9px, 11px)",
  next,
  interactive = true,
  className = "",
}: LockedPriceProps) {
  const content = (
    <>
      <LockGlyph />
      Sign in for price
    </>
  );

  const shared = `inline-flex items-center gap-1.5 whitespace-nowrap font-mono tracking-[0.22em] uppercase text-muted-foreground ${className}`;

  if (!interactive) {
    return (
      <span className={shared} style={{ fontSize }}>
        {content}
      </span>
    );
  }

  return (
    <Link
      href={next ? `/login?redirect=${encodeURIComponent(next)}` : "/login"}
      // z-10 keeps this clickable above the stretched card overlay.
      className={`relative z-10 ${shared} transition-colors hover:text-brand`}
      style={{ fontSize }}
    >
      {content}
    </Link>
  );
}

/**
 * Placeholder shown while the session resolves, so prices don't flash in
 * and out on first paint. Same footprint as the locked label.
 */
export function PricePlaceholder({
  fontSize = "clamp(10px, 0.3vw + 9px, 11px)",
}: {
  fontSize?: string;
}) {
  return (
    <span
      aria-hidden
      className="inline-flex items-center font-mono tracking-[0.22em] uppercase text-muted-foreground/40"
      style={{ fontSize }}
    >
      ·····
    </span>
  );
}

type GatedPriceProps = {
  value: number;
  /** Type scale for the figure itself. */
  fontSize: string;
  /** Type scale for the "USD" prefix and the locked/loading states. */
  labelFontSize?: string;
  className?: string;
  next?: string;
  interactive?: boolean;
};

/**
 * Drop-in "USD $X" display with the gate built in.
 *
 * A client component so it can be rendered from server components — the
 * marketing catalog is server-rendered and shouldn't have to become a
 * client component just to hide a number.
 */
export function GatedPrice({
  value,
  fontSize,
  labelFontSize = "clamp(9px, 0.25vw + 8px, 10px)",
  className = "",
  next,
  interactive = true,
}: GatedPriceProps) {
  const { visible, loading } = usePriceVisibility();

  if (loading) return <PricePlaceholder fontSize={labelFontSize} />;
  if (!visible) {
    return (
      <LockedPrice
        fontSize={labelFontSize}
        next={next}
        interactive={interactive}
      />
    );
  }

  return (
    <div
      className={`flex items-baseline gap-1 font-display leading-none tracking-tight ${className}`}
      style={{ fontSize }}
    >
      <span
        className="font-mono tracking-[0.25em] uppercase text-muted-foreground"
        style={{ fontSize: labelFontSize }}
      >
        USD
      </span>
      <span>${value}</span>
    </div>
  );
}

function LockGlyph() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      className="size-[1em] shrink-0"
    >
      <rect x="4" y="10" width="16" height="10" rx="1.5" />
      <path d="M8 10V7a4 4 0 1 1 8 0v3" />
    </svg>
  );
}
