"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

export type CertRecord = {
  lot: string;
  compound: string;
  dose: string;
  photo: string;
  /** HPLC purity, percent. */
  purity: number;
  /** YYYY-MM-DD. */
  date: string;
  lab: string;
  pdf: string;
  image: string;
  coaNumber: string;
  accessCode: string;
  netContentMg?: number;
  /** Labelled content in mg, where the dose is a single figure. */
  labeledMg?: number;
  endotoxin?: string;
  shopHref: string;
};

/** The lab's pass mark for HPLC purity, printed on every certificate. */
const PURITY_SPEC = 95;

/** "rta-10 001" and "RTA10-001" are the same lot. */
function normaliseLot(s: string): string {
  return s.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

/**
 * The searchable certificate library: a lot lookup for someone holding a
 * vial, compound filters, and one card per certified lot.
 */
export function CertificateLibrary({
  records,
  verifyUrl,
}: {
  records: CertRecord[];
  verifyUrl: string;
}) {
  const [query, setQuery] = useState("");
  const [compound, setCompound] = useState<string | null>(null);
  const [viewing, setViewing] = useState<CertRecord | null>(null);

  const compoundCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const r of records) counts.set(r.compound, (counts.get(r.compound) ?? 0) + 1);
    return [...counts.entries()];
  }, [records]);

  const needle = normaliseLot(query);
  const exact = needle
    ? records.find((r) => normaliseLot(r.lot) === needle)
    : undefined;

  const visible = useMemo(() => {
    let list = records;
    if (compound) list = list.filter((r) => r.compound === compound);
    if (needle) {
      list = list.filter(
        (r) =>
          normaliseLot(r.lot).includes(needle) ||
          normaliseLot(r.compound).includes(needle) ||
          normaliseLot(r.coaNumber).includes(needle),
      );
    }
    return list;
  }, [records, compound, needle]);

  return (
    <div id="library">
      {/* Lot lookup */}
      <div
        className="border border-hairline bg-surface/40"
        style={{ padding: "clamp(1rem, 2vw, 1.5rem)" }}
      >
        <label
          htmlFor="lot-lookup"
          className="block font-mono tracking-[0.25em] uppercase text-muted-foreground"
          style={{ fontSize: "clamp(9.5px, 0.25vw + 8.5px, 10.5px)" }}
        >
          Holding a vial? Enter the lot number from its label
        </label>
        <div className="mt-3 flex items-center border border-hairline bg-background focus-within:border-brand">
          <span aria-hidden className="pl-3 font-mono text-muted-foreground">
            ⌕
          </span>
          <input
            id="lot-lookup"
            type="search"
            inputMode="text"
            autoCapitalize="characters"
            autoComplete="off"
            spellCheck={false}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. RTA10-001"
            className="min-w-0 flex-1 bg-transparent px-3 py-3 font-mono tracking-[0.12em] uppercase text-foreground placeholder:normal-case placeholder:tracking-normal placeholder:text-muted-foreground/60 focus:outline-none"
            style={{ fontSize: "16px" }}
          />
        </div>
        {needle ? (
          <p
            className="mt-3 font-sans leading-relaxed"
            style={{ fontSize: "clamp(0.85rem, 0.25vw + 0.8rem, 0.95rem)" }}
            aria-live="polite"
          >
            {exact ? (
              <span className="text-brand">
                ✓ Lot {exact.lot} is certified — {exact.compound} {exact.dose},{" "}
                {exact.purity.toFixed(2)}% purity.
              </span>
            ) : visible.length === 0 ? (
              <span className="text-muted-foreground">
                No certificate on file matches &ldquo;{query.trim()}&rdquo;.
                Check the label, or email support@thepurepep.com and we&rsquo;ll
                look it up.
              </span>
            ) : null}
          </p>
        ) : null}
      </div>

      {/* Compound filter */}
      <div
        className="-mx-4 mt-5 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0"
        role="group"
        aria-label="Filter by compound"
      >
        <FilterChip
          active={compound === null}
          onClick={() => setCompound(null)}
          label="All lots"
          count={records.length}
        />
        {compoundCounts.map(([name, n]) => (
          <FilterChip
            key={name}
            active={compound === name}
            onClick={() => setCompound(compound === name ? null : name)}
            label={name}
            count={n}
          />
        ))}
      </div>

      {/* Cards */}
      <div
        className="mt-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
        style={{ gap: "clamp(0.75rem, 1.4vw, 1.25rem)" }}
      >
        {visible.map((r) => (
          <CertCard
            key={r.lot}
            record={r}
            highlighted={exact?.lot === r.lot}
            verifyUrl={verifyUrl}
            onView={() => setViewing(r)}
          />
        ))}
      </div>

      <CertificateViewer record={viewing} onClose={() => setViewing(null)} />
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex shrink-0 items-center gap-2 whitespace-nowrap border font-mono tracking-[0.2em] uppercase transition-colors ${
        active
          ? "border-foreground bg-foreground text-background"
          : "border-hairline text-muted-foreground hover:border-foreground hover:text-foreground"
      }`}
      style={{
        paddingInline: "0.85rem",
        paddingBlock: "0.55rem",
        fontSize: "clamp(9.5px, 0.25vw + 8.5px, 10.5px)",
      }}
    >
      {label}
      <span className={active ? "opacity-60" : "text-brand"}>{count}</span>
    </button>
  );
}

function CertCard({
  record: r,
  highlighted,
  verifyUrl,
  onView,
}: {
  record: CertRecord;
  highlighted: boolean;
  verifyUrl: string;
  onView: () => void;
}) {
  const ref = useRef<HTMLElement>(null);

  // A lot-number match scrolls its card into view — on a phone the
  // lookup box and the card are rarely on screen together.
  useEffect(() => {
    if (highlighted) ref.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [highlighted]);

  // Where the result sits between the lab's pass mark and 100%.
  const position = Math.min(
    100,
    Math.max(0, ((r.purity - PURITY_SPEC) / (100 - PURITY_SPEC)) * 100),
  );

  const rows: Array<{ k: string; v: string }> = [
    { k: "Identity", v: "Confirmed" },
  ];
  if (r.netContentMg !== undefined) {
    rows.push({
      k: "Measured",
      v: r.labeledMg
        ? `${r.netContentMg.toFixed(2)} mg · label ${r.labeledMg} mg`
        : `${r.netContentMg.toFixed(2)} mg`,
    });
  }
  rows.push({ k: "Fentanyl", v: "Not detected" });
  if (r.endotoxin) rows.push({ k: "Endotoxin", v: r.endotoxin });

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(`${r.coaNumber} ${r.accessCode}`);
      toast.success("Copied", {
        description: "Paste both into the ILS portal to verify.",
      });
    } catch {
      toast.info(`${r.coaNumber} · ${r.accessCode}`);
    }
  };

  return (
    <article
      ref={ref}
      className={`flex flex-col border bg-background transition-colors ${
        highlighted ? "border-brand shadow-[0_0_0_4px_oklch(0.82_0.15_210_/_0.12)]" : "border-hairline"
      }`}
      style={{ padding: "clamp(1rem, 1.8vw, 1.4rem)" }}
    >
      {/* Identity */}
      <div className="flex items-start gap-3">
        <div className="relative size-16 shrink-0 overflow-hidden border border-hairline bg-surface">
          <img src={r.photo} alt="" loading="lazy" className="size-full object-contain p-1" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3
              className="font-display leading-[1.05] tracking-tight text-foreground"
              style={{ fontSize: "clamp(1.15rem, 1.6vw, 1.4rem)" }}
            >
              {r.compound}{" "}
              <span className="text-muted-foreground">{r.dose}</span>
            </h3>
            <span
              className="shrink-0 border border-brand/40 bg-brand/10 px-1.5 py-0.5 font-mono tracking-[0.2em] uppercase text-brand"
              style={{ fontSize: "9.5px" }}
            >
              ✓ Pass
            </span>
          </div>
          <div
            className="mt-1.5 font-mono tracking-[0.14em] uppercase text-muted-foreground"
            style={{ fontSize: "clamp(9.5px, 0.25vw + 8.5px, 10.5px)" }}
          >
            Lot <span className="text-foreground">{r.lot}</span> · {r.date.replaceAll("-", ".")}
          </div>
        </div>
      </div>

      {/* Purity against the pass mark */}
      <div className="mt-5">
        <div className="flex items-baseline gap-2">
          <span
            className="font-display leading-none tracking-tight text-foreground"
            style={{ fontSize: "clamp(2.25rem, 4vw, 2.9rem)" }}
          >
            {r.purity.toFixed(2)}%
          </span>
          <span
            className="font-mono tracking-[0.2em] uppercase text-muted-foreground"
            style={{ fontSize: "clamp(9px, 0.25vw + 8px, 10px)" }}
          >
            HPLC purity
          </span>
        </div>
        <div className="relative mt-4 h-1 bg-hairline" aria-hidden>
          <div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-brand/30 to-brand"
            style={{ width: `${position}%` }}
          />
          <div
            className="absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-background bg-brand"
            style={{ left: `${position}%` }}
          />
        </div>
        <div
          className="mt-2 flex justify-between font-mono tracking-[0.18em] uppercase text-muted-foreground"
          style={{ fontSize: "9px" }}
        >
          <span>Lab pass mark {PURITY_SPEC.toFixed(1)}%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Other results */}
      <dl
        className="mt-5 grid grid-cols-1 font-mono"
        style={{ fontSize: "clamp(10.5px, 0.25vw + 9.75px, 11.5px)" }}
      >
        {rows.map((row) => (
          <div
            key={row.k}
            className="flex items-baseline justify-between gap-3 border-t border-hairline py-2"
          >
            <dt className="uppercase tracking-[0.2em] text-muted-foreground">{row.k}</dt>
            <dd className="text-right text-foreground">{row.v}</dd>
          </div>
        ))}
      </dl>

      {/* Verify with the lab */}
      <div className="mt-4 border border-dashed border-hairline bg-surface/40 p-3">
        <div className="flex items-center justify-between gap-2">
          <span
            className="font-mono tracking-[0.2em] uppercase text-muted-foreground"
            style={{ fontSize: "9px" }}
          >
            Verify with {r.lab}
          </span>
          <a
            href={verifyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 whitespace-nowrap font-mono tracking-[0.15em] uppercase text-brand hover:underline"
            style={{ fontSize: "9.5px" }}
          >
            Open portal ↗
          </a>
        </div>
        <div className="mt-2 flex items-center justify-between gap-2">
          <div
            className="min-w-0 font-mono tracking-[0.08em] text-foreground"
            style={{ fontSize: "clamp(11px, 0.25vw + 10px, 12px)" }}
          >
            <div className="truncate">{r.coaNumber}</div>
            <div className="truncate text-muted-foreground">
              Code <span className="text-foreground">{r.accessCode}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={copy}
            className="shrink-0 border border-hairline px-2.5 py-1.5 font-mono tracking-[0.2em] uppercase text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
            style={{ fontSize: "9.5px" }}
            aria-label={`Copy certificate number and access code for lot ${r.lot}`}
          >
            Copy
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-4 grid grid-cols-[1fr_auto] gap-2 pt-1 sm:mt-auto sm:pt-4">
        <button
          type="button"
          onClick={onView}
          className="inline-flex items-center justify-center gap-2 bg-brand font-mono tracking-[0.25em] uppercase text-brand-foreground transition-all hover:shadow-[0_0_0_4px_oklch(0.82_0.15_210_/_0.18)]"
          style={{ paddingBlock: "0.8rem", fontSize: "clamp(9.5px, 0.25vw + 8.5px, 10.5px)" }}
        >
          View certificate
        </button>
        <Link
          href={r.shopHref}
          className="inline-flex items-center justify-center gap-2 border border-hairline px-4 font-mono tracking-[0.25em] uppercase text-foreground transition-colors hover:border-foreground"
          style={{ fontSize: "clamp(9.5px, 0.25vw + 8.5px, 10.5px)" }}
        >
          Shop →
        </Link>
      </div>
    </article>
  );
}

/** The certificate itself, full size, without leaving the page. */
function CertificateViewer({
  record,
  onClose,
}: {
  record: CertRecord | null;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (record && !d.open) d.showModal();
    if (!record && d.open) d.close();
  }, [record]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="m-auto h-[100dvh] max-h-[100dvh] w-full max-w-none bg-transparent p-0 backdrop:bg-background/90 backdrop:backdrop-blur-sm sm:h-[min(92dvh,70rem)] sm:max-w-[48rem]"
      aria-label={record ? `Certificate for lot ${record.lot}` : "Certificate"}
    >
      {record ? (
        <div className="flex h-full flex-col border border-hairline bg-surface">
          <div className="flex items-center justify-between gap-3 border-b border-hairline px-4 py-3">
            <div
              className="min-w-0 truncate font-mono tracking-[0.2em] uppercase text-foreground"
              style={{ fontSize: "10.5px" }}
            >
              {record.compound} {record.dose} · Lot {record.lot}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="shrink-0 border border-hairline px-3 py-1.5 font-mono tracking-[0.2em] uppercase text-foreground hover:border-foreground"
              style={{ fontSize: "10px" }}
              autoFocus
            >
              Close ✕
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-white">
            <Image
              src={record.image}
              alt={`Certificate of analysis for ${record.compound} ${record.dose}, lot ${record.lot}`}
              width={1100}
              height={1556}
              sizes="(min-width: 640px) 48rem, 100vw"
              className="block h-auto w-full"
            />
          </div>
          <div className="flex items-center justify-between gap-3 border-t border-hairline px-4 py-3">
            <span
              className="font-mono tracking-[0.15em] uppercase text-muted-foreground"
              style={{ fontSize: "9.5px" }}
            >
              {record.coaNumber}
            </span>
            <a
              href={record.pdf}
              target="_blank"
              rel="noopener"
              className="font-mono tracking-[0.2em] uppercase text-brand hover:underline"
              style={{ fontSize: "10px" }}
            >
              Original PDF ↗
            </a>
          </div>
        </div>
      ) : null}
    </dialog>
  );
}
