import Link from "next/link";
import { compounds, compoundSlug, defaultVariant } from "@/lib/compounds";

/** Catalogue entries still carry "TBD" and 0 placeholders; show a dash. */
const fmtText = (v: string) => (!v || v === "TBD" ? "—" : v);
const fmtMw = (mw: number) => (mw > 0 ? `${mw} g/mol` : "—");

export function CompoundIndex() {
  return (
    <section id="catalog" className="relative border-b border-hairline">
      {/* Section heading */}
      <div
        className="mx-auto w-full max-w-[var(--content-max)] pad-x"
        style={{
          paddingTop: "clamp(3.5rem, 7vw, 8rem)",
          paddingBottom: "clamp(2rem, 3vw, 3rem)",
        }}
      >
        <div
          className="flex flex-col xl:flex-row xl:items-end xl:justify-between"
          style={{ gap: "clamp(1.25rem, 2.5vw, 2.5rem)" }}
        >
          <div className="flex-1">
            <div className="section-eyebrow">
              <span className="whitespace-nowrap text-brand">§ 04</span>
              <span
                className="h-px shrink-0 bg-hairline"
                style={{ width: "clamp(1.5rem, 3vw, 2.75rem)" }}
              />
              <span>Compound index</span>
            </div>
            <h2
              className="display-lg"
              style={{ marginTop: "clamp(1rem, 1.5vw, 1.5rem)" }}
            >
              The archive
              <span className="italic font-light text-muted-foreground">
                {" "}
                — {compounds.length} entries,
              </span>
              <br />
              each <span className="italic text-gradient-brand">reproducible.</span>
            </h2>
          </div>
          <p
            className="max-w-md font-sans leading-relaxed text-muted-foreground xl:max-w-xs xl:pb-3 xl:text-right"
            style={{ fontSize: "clamp(0.85rem, 0.25vw + 0.8rem, 0.95rem)" }}
          >
            Every compound below is maintained as a live monograph. Open an
            entry for synthesis route, stability data, the full CoA, and
            buffer-compatibility notes.
          </p>
        </div>
      </div>

      {/* Column header.
          Repeated over each column at xl, where the list runs two-up — a
          single header cannot label two independent grids. */}
      <div className="mx-auto hidden w-full max-w-[var(--content-max)] border-y border-hairline bg-background pad-x md:block xl:hidden">
        <div
          className="grid xl:grid-cols-2"
          style={{ columnGap: "clamp(1.5rem, 3vw, 3rem)" }}
        >
          <ColumnHeader />
        </div>
      </div>

      {/* Rows */}
      <div className="mx-auto w-full max-w-[var(--content-max)] pad-x">
        <div
          className="grid grid-cols-2 md:grid-cols-1 xl:grid-cols-2"
          style={{ columnGap: "clamp(0.75rem, 3vw, 3rem)" }}
        >
        {compounds.map((c, i) => {
          const v = defaultVariant(c);
          return (
          <Link
            key={c.accession}
            href={`/product/${compoundSlug(c)}`}
            className="group block border-b border-hairline transition-colors hover:bg-surface/60"
          >
            {/* MOBILE stack */}
            <div
              className="flex flex-col md:hidden xl:flex"
              style={{
                gap: "clamp(0.875rem, 2vw, 1.25rem)",
                paddingBlock: "clamp(1.25rem, 3vw, 1.75rem)",
              }}
            >
              <div className="flex flex-col items-start gap-1 sm:flex-row sm:justify-between sm:gap-4">
                <div
                  className="flex items-baseline gap-3 font-mono tracking-[0.22em] uppercase text-muted-foreground"
                  style={{ fontSize: "clamp(10px, 0.3vw + 9px, 11px)" }}
                >
                  <span className="text-foreground">{c.accession}</span>
                  <span className="hidden sm:inline">
                    {String(i + 1).padStart(2, "0")} / {compounds.length}
                  </span>
                </div>
                <div
                  className="flex items-baseline gap-1 font-display leading-none tracking-tight"
                  style={{ fontSize: "clamp(1.6rem, 5vw, 2rem)" }}
                >
                  <span
                    className="font-mono tracking-[0.25em] uppercase text-muted-foreground"
                    style={{ fontSize: "clamp(9px, 0.25vw + 8px, 10px)" }}
                  >
                    USD
                  </span>
                  <span>${v.price}</span>
                </div>
              </div>
              <div>
                <h3
                  className="font-display leading-none tracking-tight text-foreground transition-colors group-hover:text-brand"
                  style={{ fontSize: "clamp(1.2rem, 6vw, 2.5rem)" }}
                >
                  {c.name}
                </h3>
                <div
                  className="mt-1.5 font-mono tracking-[0.22em] uppercase text-muted-foreground"
                  style={{ fontSize: "clamp(9px, 0.25vw + 8px, 10.5px)" }}
                >
                  {c.family}
                </div>
              </div>
              <p
                className="hidden font-sans leading-relaxed text-muted-foreground xl:block"
                style={{ fontSize: "clamp(0.83rem, 0.25vw + 0.75rem, 0.9rem)" }}
              >
                {c.blurb}
              </p>
              <div
                className="hidden grid-cols-2 border-t border-hairline font-mono leading-relaxed tracking-[0.06em] text-foreground/80 xl:grid"
                style={{
                  gap: "clamp(0.65rem, 1.5vw, 0.85rem)",
                  paddingTop: "clamp(0.875rem, 1.5vw, 1.1rem)",
                  fontSize: "clamp(10px, 0.3vw + 9px, 11px)",
                }}
              >
                <div>
                  <div className="tracking-[0.22em] uppercase text-muted-foreground" style={{ fontSize: "clamp(9px, 0.25vw + 8px, 10px)" }}>
                    Sequence
                  </div>
                  <div className="mt-1 break-all">{fmtText(c.sequence)}</div>
                </div>
                <div>
                  <div className="tracking-[0.22em] uppercase text-muted-foreground" style={{ fontSize: "clamp(9px, 0.25vw + 8px, 10px)" }}>
                    Lot
                  </div>
                  <div className="mt-1">{fmtText(v.lot)}</div>
                </div>
                <div>
                  <div className="tracking-[0.22em] uppercase text-muted-foreground" style={{ fontSize: "clamp(9px, 0.25vw + 8px, 10px)" }}>
                    MW
                  </div>
                  <div className="mt-1">{fmtMw(c.molecularWeight)}</div>
                </div>
                <div>
                  <div className="tracking-[0.22em] uppercase text-muted-foreground" style={{ fontSize: "clamp(9px, 0.25vw + 8px, 10px)" }}>
                    Purity · Stock
                  </div>
                  <div className="mt-1 text-brand">
                    {v.purity ?? c.purity}% · {v.inStock}
                  </div>
                </div>
              </div>
            </div>

            {/* MD–LG compact */}
            <div
              className="hidden items-center md:grid xl:hidden"
              style={{
                gridTemplateColumns: "64px minmax(0,2fr) minmax(0,1fr) 100px 110px",
                gap: "clamp(0.875rem, 1.5vw, 1.25rem)",
                paddingBlock: "clamp(1.25rem, 2vw, 1.65rem)",
              }}
            >
              <div
                className="flex flex-col gap-1 font-mono tracking-[0.2em] uppercase"
                style={{ fontSize: "clamp(10px, 0.3vw + 9px, 11px)" }}
              >
                <span className="text-foreground">{c.accession}</span>
                <span className="text-muted-foreground" style={{ fontSize: "clamp(9px, 0.2vw + 8.5px, 10px)" }}>
                  {String(i + 1).padStart(2, "0")} / {compounds.length}
                </span>
              </div>
              <div className="min-w-0">
                <div className="flex items-baseline" style={{ gap: "clamp(0.5rem,1vw,0.75rem)" }}>
                  <h3
                    className="truncate font-display leading-none tracking-tight text-foreground transition-colors group-hover:text-brand"
                    style={{ fontSize: "clamp(1.5rem, 2.8vw, 2.1rem)" }}
                  >
                    {c.name}
                  </h3>
                  <span
                    className="whitespace-nowrap font-mono tracking-[0.22em] uppercase text-muted-foreground"
                    style={{ fontSize: "clamp(9px, 0.2vw + 8.5px, 10px)" }}
                  >
                    {c.family}
                  </span>
                </div>
                <div
                  className="mt-1.5 truncate font-mono tracking-[0.08em] text-foreground/70"
                  style={{ fontSize: "clamp(10px, 0.3vw + 9px, 11px)" }}
                >
                  {fmtText(c.sequence)}
                  <span className="text-muted-foreground"> · Lot {fmtText(v.lot)}</span>
                </div>
              </div>
              <div
                className="font-mono tracking-[0.08em]"
                style={{ fontSize: "clamp(10px, 0.3vw + 9px, 11px)" }}
              >
                <div className="text-foreground">{fmtMw(c.molecularWeight)}</div>
                <div className="mt-1 text-brand">{v.purity ?? c.purity}%</div>
              </div>
              <div
                className="text-right font-mono tracking-[0.08em]"
                style={{ fontSize: "clamp(10px, 0.3vw + 9px, 11px)" }}
              >
                <div className="flex items-center justify-end gap-2">
                  <span
                    className={`size-1.5 rounded-full ${
                      v.inStock > 100 ? "bg-brand" : "bg-muted-foreground"
                    }`}
                  />
                  <span className="text-foreground">{v.inStock}</span>
                </div>
                <div
                  className="mt-1 uppercase tracking-[0.2em] text-muted-foreground"
                  style={{ fontSize: "clamp(9px, 0.2vw + 8.5px, 10px)" }}
                >
                  {v.dose}
                </div>
              </div>
              <div className="flex justify-end">
                <div
                  className="flex items-baseline gap-1 font-display leading-none tracking-tight"
                  style={{ fontSize: "clamp(1.5rem, 2.8vw, 2.1rem)" }}
                >
                  <span
                    className="font-mono tracking-[0.25em] uppercase text-muted-foreground"
                    style={{ fontSize: "clamp(9px, 0.2vw + 8.5px, 10px)" }}
                  >
                    USD
                  </span>
                  <span>${v.price}</span>
                </div>
              </div>
            </div>

          </Link>
          );
        })}
        </div>
      </div>

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

/** One set of column labels, matching the compact row's grid exactly. */
function ColumnHeader() {
  return (
    <div
      className="grid items-center"
      style={{
        gridTemplateColumns: "64px minmax(0,2fr) minmax(0,1fr) 100px 110px",
        gap: "clamp(0.875rem, 1.5vw, 1.25rem)",
        paddingBlock: "clamp(0.6rem, 0.8vw, 0.85rem)",
        fontSize: "clamp(9.5px, 0.25vw + 8.5px, 10px)",
      }}
    >
      <div className="font-mono tracking-[0.25em] uppercase text-muted-foreground">№</div>
      <div className="font-mono tracking-[0.25em] uppercase text-muted-foreground">Compound</div>
      <div className="font-mono tracking-[0.25em] uppercase text-muted-foreground">Purity</div>
      <div className="text-right font-mono tracking-[0.25em] uppercase text-muted-foreground">Stock</div>
      <div className="text-right font-mono tracking-[0.25em] uppercase text-muted-foreground">USD</div>
    </div>
  );
}
