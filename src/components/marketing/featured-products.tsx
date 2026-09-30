import Link from "next/link";
import { compounds } from "@/lib/compounds";
import { ProductCard } from "@/components/shop/product-card";
import { ProductGrid } from "@/components/shop/product-grid";

/**
 * Shoppable cards, high on the page.
 *
 * The homepage previously ran a full screen of hero copy, then a rail of
 * vials with no names or prices on it — the first card a visitor could
 * actually price and buy sat past 1,200px. This puts real products, with
 * photo, size, stock and price, directly under the hero.
 *
 * Eight is deliberate: two rows of four on a wide screen, enough to show
 * range without turning the homepage into the catalogue. The rest are one
 * click away.
 */
const FEATURED_COUNT = 8;

export function FeaturedProducts() {
  // First eight of the catalogue. Swap for a curated list once there is a
  // real bestsellers ranking — picking favourites here without sales data
  // would just be a guess dressed up as a recommendation.
  const featured = compounds.slice(0, FEATURED_COUNT);

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
              <span>Shop</span>
            </div>
            <h2
              className="font-display leading-[0.95] tracking-[-0.02em]"
              style={{
                marginTop: "clamp(0.75rem, 1.2vw, 1.1rem)",
                fontSize: "clamp(1.9rem, 4.5vw, 3.25rem)",
              }}
            >
              In stock,{" "}
              <span className="italic text-gradient-brand">ships today.</span>
            </h2>
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

        <div style={{ marginTop: "clamp(1.5rem, 2.5vw, 2.25rem)" }}>
          <ProductGrid>
            {featured.map((c) => (
              <ProductCard key={c.accession} compound={c} />
            ))}
          </ProductGrid>
        </div>
      </div>
    </section>
  );
}
