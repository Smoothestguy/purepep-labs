"use client";

import type { Compound, Variant } from "@/lib/compounds";
import { BuyButton } from "./buy-button";
import { CompoundVial } from "./compound-vial";
import { VariantPicker } from "./variant-picker";
import { useSelectedVariant } from "./use-selected-variant";
import { LockedPrice, PricePlaceholder, usePriceVisibility } from "./price";

/**
 * Reads the URL-selected variant. This is the only piece that touches
 * `useSearchParams`, so the page wraps it in a `<Suspense>` boundary and
 * renders `<ProductSidebarView>` (default variant) as the prerendered fallback.
 */
export function ProductDetailSidebar({ compound }: { compound: Compound }) {
  const variant = useSelectedVariant(compound);
  return <ProductSidebarView compound={compound} variant={variant} />;
}

type ViewProps = {
  compound: Compound;
  variant: Variant;
};

export function ProductSidebarView({ compound, variant }: ViewProps) {
  const { visible: priceVisible, loading: priceLoading } = usePriceVisibility();

  return (
    <div
      className="lg:sticky"
      style={{
        top: "clamp(5rem, 8vw, 7rem)",
        display: "flex",
        flexDirection: "column",
        gap: "clamp(1.25rem, 2vw, 1.75rem)",
      }}
    >
      <CompoundVial compound={compound} variant={variant} />

      <VariantPicker compound={compound} selectedDose={variant.dose} />

      {/* Specifications card */}
      <div
        className="border border-hairline bg-surface/40"
        style={{ padding: "clamp(1.1rem, 1.6vw, 1.5rem)" }}
      >
        <div
          className="font-mono tracking-[0.25em] uppercase text-muted-foreground"
          style={{ fontSize: "clamp(9.5px, 0.25vw + 8.5px, 10.5px)" }}
        >
          Specifications
        </div>
        <dl
          className="grid grid-cols-1 font-mono"
          style={{
            marginTop: "clamp(0.85rem, 1.2vw, 1rem)",
            rowGap: "clamp(0.5rem, 0.8vw, 0.7rem)",
            fontSize: "clamp(10.5px, 0.3vw + 9.5px, 12px)",
          }}
        >
          {[
            { k: "Lot", v: variant.lot },
            { k: "Dose", v: variant.dose },
            { k: "In stock", v: `${variant.inStock} vials` },
            { k: "Dispatch", v: "Within 24h" },
            { k: "Storage", v: "−20 °C · thaw once" },
          ].map((row) => (
            <div
              key={row.k}
              className="flex items-baseline justify-between gap-4 border-b border-hairline pb-1.5 last:border-0 last:pb-0"
            >
              <dt className="uppercase tracking-[0.22em] text-muted-foreground">
                {row.k}
              </dt>
              <dd className="text-foreground">{row.v}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Buy panel */}
      <div
        className="border border-hairline bg-background"
        style={{ padding: "clamp(1.1rem, 1.8vw, 1.75rem)" }}
      >
        <div
          className="flex items-baseline justify-between"
          style={{ gap: "clamp(0.75rem, 1.2vw, 1rem)" }}
        >
          <div
            className="font-mono tracking-[0.25em] uppercase text-muted-foreground"
            style={{ fontSize: "clamp(9.5px, 0.25vw + 8.5px, 10.5px)" }}
          >
            Price
          </div>
          {priceVisible ? (
            <div
              className="flex items-baseline gap-1 font-display leading-none tracking-tight text-foreground"
              style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)" }}
            >
              <span
                className="font-mono tracking-[0.25em] uppercase text-muted-foreground"
                style={{ fontSize: "clamp(10px, 0.25vw + 9px, 11px)" }}
              >
                USD
              </span>
              <span>${variant.price}</span>
            </div>
          ) : priceLoading ? (
            <PricePlaceholder fontSize="clamp(12px, 0.3vw + 11px, 14px)" />
          ) : (
            <LockedPrice fontSize="clamp(10px, 0.3vw + 9px, 11px)" />
          )}
        </div>

        <div style={{ marginTop: "clamp(1.1rem, 1.5vw, 1.4rem)" }}>
          <BuyButton compound={compound} variant={variant} />
        </div>

        <p
          className="font-mono tracking-[0.22em] uppercase text-muted-foreground"
          style={{
            marginTop: "clamp(0.85rem, 1.2vw, 1rem)",
            fontSize: "clamp(9px, 0.25vw + 8px, 10.5px)",
          }}
        >
          Ships in 1–2 business days
        </p>
      </div>
    </div>
  );
}
