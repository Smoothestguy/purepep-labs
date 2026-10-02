"use client";

import Image from "next/image";
import type { Compound, Variant } from "@/lib/compounds";
import { COA_IMAGE_SIZE, coaImageSrc, coaPdfSrc } from "@/lib/compounds";
import { BuyButton } from "./buy-button";
import { CompoundVial } from "./compound-vial";
import { VariantPicker } from "./variant-picker";
import { useSelectedVariant } from "./use-selected-variant";

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

      <CertificatePanel variant={variant} />
    </div>
  );
}

/**
 * The certificate for the selected lot, shown as an image.
 *
 * Buyers in this category judge a supplier by the paperwork, and a link
 * to a PDF is a click most never make. Showing the page itself — purity,
 * lot and the lab's own verification code visible without leaving —
 * puts the proof where the decision happens. The whole certificate stays
 * one tap away as the original PDF.
 *
 * Follows the selected dose. A lot without a certificate says so plainly
 * instead of borrowing another dose's paperwork.
 */
function CertificatePanel({ variant }: { variant: Variant }) {
  const image = coaImageSrc(variant);
  const pdf = coaPdfSrc(variant);

  const label = (
    <div
      className="font-mono tracking-[0.25em] uppercase text-muted-foreground"
      style={{ fontSize: "clamp(9.5px, 0.25vw + 8.5px, 10.5px)" }}
    >
      Certificate of analysis
    </div>
  );

  if (!image || !pdf) {
    return (
      <div
        className="border border-hairline bg-surface/40"
        style={{ padding: "clamp(1.1rem, 1.6vw, 1.5rem)" }}
      >
        {label}
        <p
          className="font-sans leading-relaxed text-muted-foreground"
          style={{
            marginTop: "clamp(0.6rem, 1vw, 0.8rem)",
            fontSize: "clamp(0.85rem, 0.25vw + 0.8rem, 0.95rem)",
          }}
        >
          The certificate for lot {variant.lot === "TBD" ? "—" : variant.lot}{" "}
          ({variant.dose}) is with the laboratory. It is published here as
          soon as it is issued — or email support@thepurepep.com and we will
          send it when it lands.
        </p>
      </div>
    );
  }

  return (
    <div className="border border-hairline bg-surface/40">
      <div
        className="flex items-baseline justify-between gap-3"
        style={{ padding: "clamp(1.1rem, 1.6vw, 1.5rem)" }}
      >
        {label}
        <span
          className="font-mono tracking-[0.2em] uppercase text-brand"
          style={{ fontSize: "clamp(9.5px, 0.25vw + 8.5px, 10.5px)" }}
        >
          ✓ {variant.purity ? `${variant.purity.toFixed(2)}%` : "Pass"} · {variant.lot}
        </span>
      </div>

      <a
        href={pdf}
        target="_blank"
        rel="noopener"
        className="group relative block overflow-hidden border-t border-hairline"
        aria-label={`Open the full certificate for lot ${variant.lot} (PDF)`}
      >
        {/* The top of the page carries everything a buyer checks — lab,
            lot, purity, verification code — so it is shown uncropped and
            the chromatogram below fades out into the link. */}
        <div className="relative max-h-[26rem] overflow-hidden bg-white">
          <Image
            src={image}
            alt={`Certificate of analysis for lot ${variant.lot}, ${variant.dose}`}
            width={COA_IMAGE_SIZE.width}
            height={COA_IMAGE_SIZE.height}
            sizes="(min-width: 1024px) 34vw, 92vw"
            className="block h-auto w-full transition-transform duration-500 group-hover:scale-[1.015]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-24"
            style={{
              background:
                "linear-gradient(to bottom, transparent, var(--background))",
            }}
          />
        </div>
        <div
          className="flex items-center justify-between gap-3 font-mono tracking-[0.3em] uppercase text-foreground transition-colors group-hover:text-brand"
          style={{
            padding: "clamp(0.85rem, 1.2vw, 1.1rem) clamp(1.1rem, 1.6vw, 1.5rem)",
            fontSize: "clamp(9.5px, 0.3vw + 8.5px, 10.5px)",
          }}
        >
          <span>Open full certificate · PDF</span>
          <span
            aria-hidden
            className="transition-transform group-hover:translate-x-1"
          >
            →
          </span>
        </div>
      </a>
    </div>
  );
}
