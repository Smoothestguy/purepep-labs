"use client";

import Link from "next/link";
import type { ReactNode } from "react";

export const SHIPPING_FLAT = 18;

type Props = {
  subtotal: number;
  /**
   * Primary CTA rendered below the totals. If omitted, the summary is
   * display-only (used on the checkout page where "Place order" lives
   * inside the form). Pass a button or a Link.
   */
  cta?: ReactNode;
  /** Override the default disclaimer if a page needs to hide it. */
  showDisclaimer?: boolean;
};

export function OrderSummary({
  subtotal,
  cta,
  showDisclaimer = true,
}: Props) {
  const shipping = subtotal > 0 ? SHIPPING_FLAT : 0;
  const total = subtotal + shipping;

  return (
    <aside
      className="border border-hairline bg-surface/40 lg:sticky"
      style={{
        padding: "clamp(1.25rem, 2vw, 1.75rem)",
        top: "clamp(5rem, 8vw, 7rem)",
      }}
    >
      <div
        className="font-mono tracking-[0.3em] uppercase text-muted-foreground"
        style={{ fontSize: "clamp(9.5px, 0.25vw + 8.5px, 10.5px)" }}
      >
        § Summary
      </div>

      <dl
        className="flex flex-col font-mono"
        style={{
          marginTop: "clamp(1rem, 1.5vw, 1.25rem)",
          gap: "clamp(0.55rem, 0.9vw, 0.75rem)",
          fontSize: "clamp(11px, 0.3vw + 10px, 12.5px)",
        }}
      >
        <SummaryRow label="Subtotal" value={`$${subtotal.toFixed(2)}`} />
        <SummaryRow label="Shipping" value={`$${shipping.toFixed(2)}`} />
        <SummaryRow
          label="Tax"
          value="$0.00"
          hint="Calculated at checkout"
        />
      </dl>

      <div
        className="mt-5 flex items-baseline justify-between border-t border-hairline pt-4"
        style={{ paddingTop: "clamp(1rem, 1.5vw, 1.25rem)" }}
      >
        <span
          className="font-mono tracking-[0.22em] uppercase text-muted-foreground"
          style={{ fontSize: "clamp(10px, 0.25vw + 9px, 11px)" }}
        >
          Total
        </span>
        <span
          className="font-display tracking-tight text-foreground"
          style={{ fontSize: "clamp(1.75rem, 2.8vw, 2.5rem)" }}
        >
          ${total.toFixed(2)}
        </span>
      </div>

      {cta ? (
        <div style={{ marginTop: "clamp(1.1rem, 1.6vw, 1.4rem)" }}>{cta}</div>
      ) : null}

      {showDisclaimer ? (
        <p
          className="font-mono tracking-[0.22em] uppercase text-muted-foreground"
          style={{
            marginTop: "clamp(1rem, 1.5vw, 1.25rem)",
            fontSize: "clamp(9px, 0.25vw + 8px, 10px)",
            lineHeight: 1.6,
          }}
        >
          ∗ For laboratory research use only. Not for human consumption.
        </p>
      ) : null}
    </aside>
  );
}

function SummaryRow({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="uppercase tracking-[0.22em] text-muted-foreground">
        {label}
        {hint ? (
          <span className="ml-2 normal-case tracking-normal text-muted-foreground/70 italic">
            {hint}
          </span>
        ) : null}
      </dt>
      <dd className="text-foreground">{value}</dd>
    </div>
  );
}

/** Reusable CTA link styled like the checkout form submit. */
export function SummaryCtaLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group inline-flex w-full items-center justify-between gap-3 bg-brand font-mono tracking-[0.3em] uppercase text-brand-foreground transition-all hover:shadow-[0_0_0_4px_oklch(0.82_0.15_210_/_0.18)]"
      style={{
        paddingInline: "clamp(1.1rem, 1.8vw, 1.6rem)",
        paddingBlock: "clamp(0.85rem, 1.1vw, 1.1rem)",
        fontSize: "clamp(10px, 0.3vw + 9px, 11px)",
      }}
    >
      <span>{children}</span>
      <span className="transition-transform group-hover:translate-x-1">→</span>
    </Link>
  );
}
