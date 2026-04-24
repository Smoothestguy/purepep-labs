"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";

export type CoaRow = {
  lot: string;
  compound: string;
  accession: string;
  purity: string;
  date: string;
  lab: string;
};

export function CoaArchive({ rows }: { rows: CoaRow[] }) {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return rows;
    return rows.filter(
      (r) =>
        r.lot.toLowerCase().includes(needle) ||
        r.compound.toLowerCase().includes(needle) ||
        r.accession.toLowerCase().includes(needle) ||
        r.lab.toLowerCase().includes(needle),
    );
  }, [q, rows]);

  const handleDownload = (lot: string) => {
    toast.info("CoA PDFs are generated in Phase 2.", {
      description: `Lot ${lot} — signature not yet available.`,
    });
  };

  return (
    <div className="border border-hairline bg-background" id="archive">
      {/* Header with search */}
      <div
        className="flex flex-col gap-3 border-b border-hairline sm:flex-row sm:items-center sm:justify-between"
        style={{
          paddingInline: "clamp(1rem, 1.5vw, 1.35rem)",
          paddingBlock: "clamp(0.85rem, 1.1vw, 1rem)",
        }}
      >
        <div
          className="flex items-center gap-2 font-mono tracking-[0.25em] uppercase text-muted-foreground"
          style={{ fontSize: "clamp(9.5px, 0.25vw + 8.5px, 10.5px)" }}
        >
          <span className="size-1.5 rounded-full bg-brand" />
          <span>Archive · {filtered.length} lot{filtered.length === 1 ? "" : "s"}</span>
        </div>
        <label className="flex w-full items-center gap-2 border border-hairline bg-surface sm:w-auto sm:min-w-[18rem]">
          <span className="sr-only">Filter</span>
          <span
            className="pl-3 font-mono tracking-[0.25em] uppercase text-muted-foreground"
            style={{ fontSize: "clamp(9px, 0.25vw + 8px, 10px)" }}
            aria-hidden
          >
            ⌕
          </span>
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Lot, compound, or lab…"
            className="min-w-0 flex-1 bg-transparent py-2 pr-3 font-mono tracking-[0.05em] text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
            style={{ fontSize: "clamp(11px, 0.25vw + 10px, 12px)" }}
          />
        </label>
      </div>

      {/* Column headers */}
      <div
        className="hidden items-center border-b border-hairline font-mono tracking-[0.25em] uppercase text-muted-foreground md:grid"
        style={{
          gridTemplateColumns:
            "minmax(96px, 130px) minmax(0, 1.6fr) minmax(84px, 130px) minmax(84px, 120px) minmax(84px, 120px) 90px",
          columnGap: "clamp(0.65rem, 1.2vw, 1rem)",
          paddingInline: "clamp(1rem, 1.5vw, 1.35rem)",
          paddingBlock: "clamp(0.7rem, 1vw, 0.85rem)",
          fontSize: "clamp(9px, 0.25vw + 8px, 10px)",
        }}
      >
        <div>Lot</div>
        <div>Compound</div>
        <div>Date</div>
        <div>Purity</div>
        <div>Lab</div>
        <div className="text-right">Actions</div>
      </div>

      {/* Rows */}
      <div className="divide-y divide-hairline">
        {filtered.length === 0 ? (
          <div
            className="px-6 py-12 text-center font-mono tracking-[0.25em] uppercase text-muted-foreground"
            style={{ fontSize: "clamp(10px, 0.3vw + 9px, 11px)" }}
          >
            No certificates match &ldquo;{q}&rdquo;.
          </div>
        ) : (
          filtered.map((r) => (
            <div
              key={`${r.lot}-${r.date}`}
              className="grid items-center transition-colors hover:bg-surface md:grid-cols-[minmax(96px,130px)_minmax(0,1.6fr)_minmax(84px,130px)_minmax(84px,120px)_minmax(84px,120px)_90px]"
              style={{
                gridTemplateColumns: "1fr auto",
                columnGap: "clamp(0.65rem, 1.2vw, 1rem)",
                paddingInline: "clamp(1rem, 1.5vw, 1.35rem)",
                paddingBlock: "clamp(0.875rem, 1.2vw, 1.1rem)",
                rowGap: "0.5rem",
              }}
            >
              {/* Lot */}
              <div>
                <div
                  className="font-mono tracking-[0.2em] uppercase text-foreground"
                  style={{ fontSize: "clamp(10px, 0.3vw + 9px, 11px)" }}
                >
                  Lot {r.lot}
                </div>
                <div
                  className="mt-0.5 font-mono tracking-[0.22em] uppercase text-muted-foreground md:hidden"
                  style={{ fontSize: "clamp(9px, 0.25vw + 8px, 10px)" }}
                >
                  {r.date} · {r.lab}
                </div>
              </div>

              {/* Compound (mobile: under lot) */}
              <div className="col-span-2 min-w-0 md:col-span-1">
                <div
                  className="truncate font-display leading-none tracking-tight text-foreground"
                  style={{ fontSize: "clamp(1.05rem, 1.5vw, 1.4rem)" }}
                >
                  {r.compound}
                </div>
                <div
                  className="mt-1 truncate font-mono tracking-[0.22em] uppercase text-muted-foreground"
                  style={{ fontSize: "clamp(9px, 0.25vw + 8px, 10px)" }}
                >
                  Spec. {r.accession}
                </div>
              </div>

              {/* Date — desktop */}
              <div
                className="hidden font-mono tracking-[0.22em] uppercase text-muted-foreground md:block"
                style={{ fontSize: "clamp(9.5px, 0.25vw + 8.5px, 10.5px)" }}
              >
                {r.date}
              </div>

              {/* Purity */}
              <div
                className="font-display leading-none text-brand"
                style={{ fontSize: "clamp(1rem, 1.3vw, 1.35rem)" }}
              >
                {r.purity}
              </div>

              {/* Lab — desktop */}
              <div
                className="hidden font-mono tracking-[0.22em] uppercase text-muted-foreground md:block"
                style={{ fontSize: "clamp(9.5px, 0.25vw + 8.5px, 10.5px)" }}
              >
                {r.lab}
              </div>

              {/* Action */}
              <div className="col-start-2 row-start-1 flex justify-end md:col-auto md:row-auto">
                <button
                  type="button"
                  onClick={() => handleDownload(r.lot)}
                  className="inline-flex items-center gap-1.5 border border-hairline font-mono tracking-[0.25em] uppercase text-foreground transition-colors hover:border-foreground hover:bg-background"
                  style={{
                    paddingInline: "clamp(0.6rem, 1vw, 0.8rem)",
                    paddingBlock: "clamp(0.35rem, 0.6vw, 0.5rem)",
                    fontSize: "clamp(9px, 0.25vw + 8px, 10px)",
                  }}
                  aria-label={`Download CoA PDF for lot ${r.lot}`}
                >
                  <span className="size-1 rounded-full bg-brand" />
                  PDF
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
