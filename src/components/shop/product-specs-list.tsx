"use client";

import type { Compound, Variant } from "@/lib/compounds";
import { useSelectedVariant } from "./use-selected-variant";

/** Reads the URL-selected variant; wrap in `<Suspense>` (fallback:
 * `<ProductSpecsListView>` with the default variant) so the page prerenders. */
export function ProductSpecsList({ compound }: { compound: Compound }) {
  const variant = useSelectedVariant(compound);
  return <ProductSpecsListView compound={compound} variant={variant} />;
}

type ViewProps = {
  compound: Compound;
  variant: Variant;
};

export function ProductSpecsListView({ compound: c, variant: v }: ViewProps) {
  const rows: { k: string; v: React.ReactNode }[] = [
    {
      k: "Sequence",
      v: <span className="break-all font-mono text-foreground">{c.sequence}</span>,
    },
    {
      k: "Molecular weight",
      v: (
        <span className="font-mono text-foreground">
          {c.molecularWeight} g/mol
        </span>
      ),
    },
    {
      k: "Purity (HPLC-MS)",
      v: <span className="font-mono text-brand">{c.purity}%</span>,
    },
    {
      k: "Dose · fill",
      v: <span className="font-mono text-foreground">{v.dose}</span>,
    },
    {
      k: "Lot number",
      v: <span className="font-mono text-foreground">{v.lot}</span>,
    },
    {
      k: "CoA date",
      v: <span className="font-mono text-foreground">{v.coaDate}</span>,
    },
    {
      k: "Storage",
      v: <span className="font-mono text-foreground">−20 °C · thaw once</span>,
    },
    {
      k: "Shipping",
      v: (
        <span className="font-mono text-foreground">
          Cold-chain, 1-day overnight
        </span>
      ),
    },
  ];

  return (
    <dl
      className="grid grid-cols-1 border-t border-hairline sm:grid-cols-2"
      style={{
        marginTop: "clamp(2.5rem, 4vw, 3.5rem)",
        paddingTop: "clamp(1.25rem, 2vw, 1.75rem)",
        columnGap: "clamp(1rem, 2vw, 2rem)",
        rowGap: "clamp(1rem, 1.5vw, 1.25rem)",
      }}
    >
      {rows.map((row) => (
        <div key={row.k}>
          <dt
            className="font-mono tracking-[0.22em] uppercase text-muted-foreground"
            style={{ fontSize: "clamp(9.5px, 0.25vw + 8.5px, 10.5px)" }}
          >
            {row.k}
          </dt>
          <dd
            className="mt-1.5"
            style={{ fontSize: "clamp(11px, 0.3vw + 10px, 13px)" }}
          >
            {row.v}
          </dd>
        </div>
      ))}
    </dl>
  );
}
