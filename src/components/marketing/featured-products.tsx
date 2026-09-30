import Link from "next/link";
import {
  compounds,
  firstCertifiedVariant,
  isCertified,
} from "@/lib/compounds";
import { ProductCard } from "@/components/shop/product-card";

/**
 * The homepage product grid: only compounds with a signed certificate.
 *
 * The homepage makes the testing promise, so what it features has to
 * keep it. Each card opens on the dose that is actually certified — for
 * GHK-Cu that is 100 mg, not the 50 mg default, which has no CoA yet.
 *
 * Grows on its own as certificates arrive: add `coaPdf` to a variant in
 * lib/compounds and the compound appears here.
 */
export function FeaturedProducts() {
  const featured = compounds.filter(isCertified);
  if (featured.length === 0) return null;

  return (
    <section
      id="featured"
      className="relative border-b border-hairline bg-background"
      style={{
        paddingTop: "clamp(2.5rem, 4vw, 4rem)",
        paddingBottom: "clamp(2.5rem, 4vw, 4rem)",
      }}
    >
      <div className="mx-auto w-full max-w-[var(--content-max)] pad-x">
        <div
          className="flex flex-wrap items-end justify-between"
          style={{ gap: "clamp(1rem, 2vw, 2rem)" }}
        >
          <div>
            <div className="section-eyebrow">
              <span className="whitespace-nowrap text-brand">§ 03</span>
              <span
                className="h-px shrink-0 bg-hairline"
                style={{ width: "clamp(1.5rem, 3vw, 2.75rem)" }}
              />
              <span>Certified lots</span>
            </div>
            <h2
              className="font-display leading-[0.95] tracking-[-0.02em]"
              style={{
                marginTop: "clamp(0.75rem, 1.2vw, 1.1rem)",
                fontSize: "clamp(1.9rem, 4.5vw, 3.25rem)",
              }}
            >
              Tested,{" "}
              <span className="italic text-gradient-brand">ships today.</span>
            </h2>
            <p
              className="max-w-md font-sans leading-relaxed text-muted-foreground"
              style={{
                marginTop: "clamp(0.6rem, 1vw, 0.85rem)",
                fontSize: "clamp(0.85rem, 0.25vw + 0.8rem, 0.95rem)",
              }}
            >
              Every compound here has a signed certificate from ILS
              Laboratories, open on its product page.
            </p>
          </div>

          <Link
            href="/shop"
            className="group inline-flex items-center gap-3 whitespace-nowrap border border-hairline font-mono tracking-[0.3em] uppercase text-foreground transition-colors hover:border-foreground"
            style={{
              paddingInline: "clamp(1rem, 1.6vw, 1.4rem)",
              paddingBlock: "clamp(0.7rem, 1vw, 0.9rem)",
              fontSize: "clamp(10px, 0.3vw + 9px, 11px)",
            }}
          >
            All {compounds.length} compounds
            <span
              aria-hidden
              className="transition-transform group-hover:translate-x-1"
            >
              →
            </span>
          </Link>
        </div>

        <div
          // Five across at xl so the current five certified compounds sit
          // in one row rather than four plus an orphan.
          className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
          style={{
            marginTop: "clamp(1.5rem, 2.5vw, 2.25rem)",
            gap: "clamp(0.5rem, 1.2vw, 1.25rem)",
          }}
        >
          {featured.map((c) => (
            <ProductCard
              key={c.accession}
              compound={c}
              initialDose={firstCertifiedVariant(c)?.dose}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
