import type { Metadata } from "next";
import { compounds, categories } from "@/lib/compounds";
import { ProductCard } from "@/components/shop/product-card";
import { ProductGrid } from "@/components/shop/product-grid";
import { CategoryTabs } from "@/components/shop/category-tabs";

export const metadata: Metadata = {
  title: "Catalog — PurePep Labs",
  description:
    "Eight live-maintained peptide monographs. HPLC-verified, lot-traceable, shipped with a third-party Certificate of Analysis.",
};

type SearchParams = Promise<{
  category?: string | string[];
}>;

type CategoryKey = (typeof categories)[number]["key"];

function isCategoryKey(value: string): value is CategoryKey {
  return categories.some((c) => c.key === value);
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const resolved = await searchParams;
  const rawCategory = Array.isArray(resolved.category)
    ? resolved.category[0]
    : resolved.category;
  const activeCategory =
    rawCategory && isCategoryKey(rawCategory) ? rawCategory : undefined;

  const visible = activeCategory
    ? compounds.filter((c) => c.category === activeCategory)
    : compounds;

  return (
    <section className="relative border-b border-hairline">
      <div
        className="mx-auto w-full max-w-[var(--content-max)] pad-x"
        style={{
          paddingTop: "clamp(3.5rem, 7vw, 8rem)",
          paddingBottom: "clamp(2rem, 3vw, 3rem)",
        }}
      >
        {/* Header */}
        <div
          className="flex flex-col xl:flex-row xl:items-end xl:justify-between"
          style={{ gap: "clamp(1.25rem, 2.5vw, 2.5rem)" }}
        >
          <div className="flex-1">
            <div
              className="flex items-center font-mono tracking-[0.3em] uppercase text-muted-foreground"
              style={{
                fontSize: "clamp(10px, 0.3vw + 9px, 11px)",
                gap: "clamp(0.75rem, 1.5vw, 1.25rem)",
              }}
            >
              <span className="whitespace-nowrap text-brand">§ 02</span>
              <span
                className="h-px shrink-0 bg-hairline"
                style={{ width: "clamp(1.5rem, 3vw, 2.75rem)" }}
              />
              <span>Catalog</span>
            </div>
            <h1
              className="font-display leading-[0.95] tracking-[-0.02em]"
              style={{
                marginTop: "clamp(1rem, 1.5vw, 1.5rem)",
                fontSize: "clamp(2.25rem, 6.3vw, 6rem)",
              }}
            >
              The archive
              <span className="italic font-light text-muted-foreground">
                {" "}
                — eight monographs,
              </span>
              <br />
              each{" "}
              <span className="italic text-gradient-brand">
                reproducible.
              </span>
            </h1>
          </div>
          <p
            className="max-w-md font-sans leading-relaxed text-muted-foreground xl:max-w-xs xl:pb-3 xl:text-right"
            style={{ fontSize: "clamp(0.85rem, 0.25vw + 0.8rem, 0.95rem)" }}
          >
            Every entry below is a live-maintained monograph. Filter by class,
            open a vial for synthesis route, stability data, and the full CoA.
          </p>
        </div>

        {/* Filter pills */}
        <div
          style={{ marginTop: "clamp(1.75rem, 3vw, 2.5rem)" }}
          aria-label="Filter by category"
        >
          <CategoryTabs active={activeCategory} />
        </div>
      </div>

      {/* Grid */}
      <div
        className="mx-auto w-full max-w-[var(--content-max)] pad-x"
        style={{ paddingBottom: "clamp(2rem, 3vw, 3rem)" }}
      >
        {visible.length > 0 ? (
          <ProductGrid>
            {visible.map((c) => (
              <ProductCard key={c.accession} compound={c} />
            ))}
          </ProductGrid>
        ) : (
          <div
            className="border border-hairline bg-surface/40 font-mono tracking-[0.22em] uppercase text-muted-foreground"
            style={{
              padding: "clamp(1.5rem, 3vw, 2.5rem)",
              fontSize: "clamp(10px, 0.3vw + 9px, 11px)",
            }}
          >
            No compounds in this class yet.
          </div>
        )}
      </div>

      {/* Footer caption */}
      <div
        className="mx-auto w-full max-w-[var(--content-max)] pad-x font-mono tracking-[0.22em] uppercase text-muted-foreground"
        style={{
          paddingTop: "clamp(1.25rem, 2vw, 1.75rem)",
          paddingBottom: "clamp(3rem, 5vw, 5rem)",
          fontSize: "clamp(9.5px, 0.25vw + 8.5px, 10.5px)",
        }}
      >
        ∗ For laboratory research use only. Not for human consumption.
      </div>
    </section>
  );
}
