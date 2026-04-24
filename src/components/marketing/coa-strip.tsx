import Link from "next/link";
import { compounds } from "@/lib/compounds";

const LAB_BY_ACCESSION: Record<string, "Janoshik" | "SSL"> = {
  "PP-003": "SSL",
  "PP-006": "SSL",
};

function formatDotted(iso: string) {
  // "2026-03-14" → "2026.03.14"
  return iso.replaceAll("-", ".");
}

const rows = [...compounds]
  .sort((a, b) => (a.coaDate < b.coaDate ? 1 : a.coaDate > b.coaDate ? -1 : 0))
  .slice(0, 6)
  .map((c) => ({
    lot: c.lot,
    compound: c.name,
    purity: `${c.purity.toFixed(2)}%`,
    date: formatDotted(c.coaDate),
    lab: LAB_BY_ACCESSION[c.accession] ?? "Janoshik",
  }));

export function CoaStrip() {
  return (
    <section id="coa" className="relative border-b border-hairline bg-surface">
      <div
        className="mx-auto grid w-full max-w-[var(--content-max)] grid-cols-1 pad-x section-y lg:grid-cols-12"
        style={{
          columnGap: "clamp(1.5rem, 3vw, 3rem)",
          rowGap: "clamp(2rem, 4vw, 3rem)",
        }}
      >
        <div className="lg:col-span-4">
          <div className="section-eyebrow">
            <span className="whitespace-nowrap text-brand">§ 04</span>
            <span className="h-px shrink-0 bg-hairline" style={{ width: "clamp(1.5rem, 3vw, 2.75rem)" }} />
            <span>Documentation</span>
          </div>
          <h2
            className="display-md"
            style={{ marginTop: "clamp(1rem, 1.5vw, 1.5rem)" }}
          >
            Every lot.
            <br />
            <span className="italic text-gradient-brand">Every time.</span>
          </h2>
          <p
            className="max-w-md font-sans leading-relaxed text-muted-foreground"
            style={{
              marginTop: "clamp(1rem, 1.5vw, 1.5rem)",
              fontSize: "clamp(0.9rem, 0.35vw + 0.82rem, 1.05rem)",
            }}
          >
            Third-party Certificates of Analysis for the last thirty months,
            indexed by lot. PDFs are signed, hashed, and publicly verifiable.
          </p>
          <Link
            href="/coa"
            className="inline-flex items-center gap-3 border border-hairline font-mono tracking-[0.3em] uppercase text-foreground transition-colors hover:border-foreground"
            style={{
              marginTop: "clamp(1.5rem, 2.5vw, 2rem)",
              paddingInline: "clamp(1rem, 1.5vw, 1.4rem)",
              paddingBlock: "clamp(0.65rem, 1vw, 0.9rem)",
              fontSize: "clamp(10px, 0.3vw + 9px, 11px)",
            }}
          >
            Browse full archive
            <span aria-hidden>→</span>
          </Link>
        </div>

        <div className="lg:col-span-8">
          <div className="border border-hairline bg-background">
            <div
              className="flex items-center justify-between gap-4 border-b border-hairline eyebrow text-muted-foreground"
              style={{
                paddingInline: "clamp(1rem, 1.5vw, 1.35rem)",
                paddingBlock: "clamp(0.7rem, 1vw, 0.85rem)",
              }}
            >
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="size-1.5 rounded-full bg-brand" />
                Latest certificates
              </div>
              <div className="text-right">SHA-256 signed</div>
            </div>
            <div className="divide-y divide-hairline">
              {rows.map((r) => (
                <Link
                  href={`/coa#${r.lot}`}
                  key={r.lot}
                  className="group grid items-center transition-colors hover:bg-surface"
                  style={{
                    gridTemplateColumns: "minmax(84px, 120px) minmax(0,1fr) auto",
                    columnGap: "clamp(0.65rem, 1.2vw, 1rem)",
                    paddingInline: "clamp(1rem, 1.5vw, 1.35rem)",
                    paddingBlock: "clamp(0.875rem, 1.2vw, 1.1rem)",
                  }}
                >
                  <div>
                    <div
                      className="font-mono tracking-[0.2em] uppercase text-foreground"
                      style={{ fontSize: "clamp(10px, 0.3vw + 9px, 11px)" }}
                    >
                      Lot {r.lot}
                    </div>
                    <div
                      className="mt-1 font-mono tracking-[0.22em] uppercase text-muted-foreground"
                      style={{ fontSize: "clamp(9px, 0.25vw + 8px, 10.5px)" }}
                    >
                      {r.date}
                    </div>
                  </div>
                  <div className="min-w-0">
                    <div
                      className="truncate font-display leading-none tracking-tight text-foreground transition-colors group-hover:text-brand"
                      style={{ fontSize: "clamp(1.1rem, 1.8vw, 1.65rem)" }}
                    >
                      {r.compound}
                    </div>
                    <div
                      className="mt-1 truncate font-mono tracking-[0.22em] uppercase text-muted-foreground"
                      style={{ fontSize: "clamp(9px, 0.25vw + 8px, 10.5px)" }}
                    >
                      Assayed by {r.lab}
                    </div>
                  </div>
                  <div className="flex items-center" style={{ gap: "clamp(0.65rem, 1.2vw, 1rem)" }}>
                    <div className="text-right">
                      <div
                        className="font-mono tracking-[0.22em] uppercase text-muted-foreground"
                        style={{ fontSize: "clamp(9px, 0.25vw + 8px, 10.5px)" }}
                      >
                        Purity
                      </div>
                      <div
                        className="font-display leading-none text-brand"
                        style={{ fontSize: "clamp(1rem, 1.4vw, 1.4rem)" }}
                      >
                        {r.purity}
                      </div>
                    </div>
                    <span
                      aria-hidden
                      className="font-mono text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-foreground"
                      style={{ fontSize: "clamp(10px, 0.3vw + 9px, 11px)" }}
                    >
                      →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
