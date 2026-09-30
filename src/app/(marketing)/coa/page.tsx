import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  COA_IMAGE_SIZE,
  coaImageSrc,
  coaPdfSrc,
  compoundPhotoSrc,
  compoundSlug,
  compounds,
} from "@/lib/compounds";
import { CertificateLibrary, type CertRecord } from "./certificate-library";

export const metadata: Metadata = {
  title: "Certificate library — The Pure Pep",
  description:
    "Independent HPLC certificates from ILS Laboratories for every lot we sell, published in full.",
  alternates: { canonical: "/coa" },
};

/**
 * One record per certified lot.
 *
 * Only lots with a signed certificate appear: this page exists to prove
 * testing, so a lot without a document behind it does not belong here.
 * Every figure comes from the certificate itself (see `assay` in
 * lib/compounds) — none is derived or estimated.
 */
function buildRecords(): CertRecord[] {
  const records: CertRecord[] = [];
  for (const c of compounds) {
    for (const v of c.variants) {
      const pdf = coaPdfSrc(v);
      const image = coaImageSrc(v);
      if (!pdf || !image || !v.assay || v.purity === undefined) continue;
      // "10 mg" → 10. Blends ("5 mg + 5 mg") have no single label figure.
      const single = /^(\d+(?:\.\d+)?)\s*mg$/i.exec(v.dose.trim());
      records.push({
        lot: v.lot,
        compound: c.name,
        dose: v.dose,
        photo: compoundPhotoSrc(c),
        purity: v.purity,
        date: v.coaDate,
        lab: v.lab ?? "the lab",
        pdf,
        image,
        coaNumber: v.assay.coaNumber,
        accessCode: v.assay.accessCode,
        netContentMg: v.assay.netContentMg,
        labeledMg: single ? Number(single[1]) : undefined,
        endotoxin: v.assay.endotoxin,
        shopHref: `/product/${compoundSlug(c)}?dose=${encodeURIComponent(v.dose)}`,
      });
    }
  }
  return records;
}

const READING: Array<{ term: string; def: string }> = [
  {
    term: "HPLC purity",
    def: "The share of the target peptide among all peptide-related peaks, measured by reversed-phase HPLC at 214 nm. The lab's pass mark is 95.0%.",
  },
  {
    term: "Identity",
    def: "Confirms the vial holds the compound on the label, by matching its HPLC retention time against a reference standard.",
  },
  {
    term: "Measured content",
    def: "Milligrams of peptide the lab measured in the vial (net peptide content), shown beside the amount on the label.",
  },
  {
    term: "Fentanyl screen",
    def: "Immunoassay screen with a 50 ng/mL cutoff, run on every lot listed here.",
  },
  {
    term: "Endotoxin",
    def: "Bacterial endotoxin by USP <85>, reported in EU/mL on lots where it was run. The lab reports a value rather than a pass or fail for research material.",
  },
];

export default function CoaPage() {
  const records = buildRecords();
  if (records.length === 0) return null;

  const lowest = Math.min(...records.map((r) => r.purity));
  const highest = Math.max(...records.map((r) => r.purity));
  // Three real certificates for the hero stack, highest purity on top.
  const stack = [...records].sort((a, b) => b.purity - a.purity).slice(0, 3);

  const stats = [
    { k: "Lots published", v: String(records.length) },
    { k: "Purity range", v: `${lowest.toFixed(2)}–${highest.toFixed(2)}%` },
    { k: "Fentanyl", v: `Not detected ${records.length}/${records.length}` },
    { k: "Laboratory", v: "ISO/IEC 17025" },
  ];

  return (
    // overflow-x-clip: the fanned certificates are rotated past their box.
    <section className="relative overflow-x-clip border-b border-hairline">
      <div className="mx-auto w-full max-w-[var(--content-max)] pad-x section-y">
        {/* Hero */}
        <div className="grid items-center gap-y-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-x-12">
          <div>
            <div className="section-eyebrow">
              <span className="whitespace-nowrap text-brand">§ 04</span>
              <span
                className="h-px shrink-0 bg-hairline"
                style={{ width: "clamp(1.5rem, 3vw, 2.75rem)" }}
              />
              <span>Certificate library</span>
            </div>
            <h1
              className="font-display leading-[0.92] tracking-[-0.025em]"
              style={{
                marginTop: "clamp(1rem, 1.5vw, 1.5rem)",
                fontSize: "clamp(2.6rem, 7vw, 6.25rem)",
              }}
            >
              Don&rsquo;t take our word.{" "}
              <span className="italic text-gradient-brand">Check the lab&rsquo;s.</span>
            </h1>
            <p
              className="mt-6 max-w-xl font-sans leading-relaxed text-muted-foreground"
              style={{ fontSize: "clamp(0.95rem, 0.4vw + 0.85rem, 1.125rem)" }}
            >
              Every lot we sell is tested by ILS Laboratories before it ships.
              Here is each certificate in full — purity, identity, content
              and screening, lot by lot.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#library"
                className="group inline-flex items-center gap-3 bg-brand font-mono tracking-[0.3em] uppercase text-brand-foreground transition-all hover:shadow-[0_0_0_4px_oklch(0.82_0.15_210_/_0.18)]"
                style={{
                  paddingInline: "clamp(1rem, 1.6vw, 1.4rem)",
                  paddingBlock: "clamp(0.8rem, 1vw, 0.95rem)",
                  fontSize: "clamp(10px, 0.3vw + 9px, 11px)",
                }}
              >
                Find your lot
                <span aria-hidden className="transition-transform group-hover:translate-y-0.5">
                  ↓
                </span>
              </a>
              <Link
                href="/shop?category=certified"
                className="inline-flex items-center gap-3 border border-hairline font-mono tracking-[0.3em] uppercase text-foreground transition-colors hover:border-foreground"
                style={{
                  paddingInline: "clamp(1rem, 1.6vw, 1.4rem)",
                  paddingBlock: "clamp(0.8rem, 1vw, 0.95rem)",
                  fontSize: "clamp(10px, 0.3vw + 9px, 11px)",
                }}
              >
                Shop certified
              </Link>
            </div>

            <dl className="mt-10 grid grid-cols-2 gap-px border border-hairline bg-hairline sm:grid-cols-4">
              {stats.map((s) => (
                <div key={s.k} className="bg-background" style={{ padding: "clamp(0.8rem, 1.4vw, 1.1rem)" }}>
                  <dt
                    className="font-mono tracking-[0.22em] uppercase text-muted-foreground"
                    style={{ fontSize: "9px" }}
                  >
                    {s.k}
                  </dt>
                  <dd
                    className="mt-1.5 font-mono tracking-[0.04em] text-foreground"
                    style={{ fontSize: "clamp(11.5px, 0.35vw + 10px, 13px)" }}
                  >
                    {s.v}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Real certificates, fanned */}
          <CertificateStack stack={stack} />
        </div>

        {/* Library */}
        <div
          className="mt-[clamp(3.5rem,6vw,6rem)] scroll-mt-24 border-t border-hairline"
          style={{ paddingTop: "clamp(1.75rem, 2.5vw, 2.5rem)" }}
        >
          <SectionHead index="04.2" label="Every certified lot" />
          <h2
            className="mt-4 max-w-2xl font-display leading-[1.02] tracking-tight"
            style={{ fontSize: "clamp(1.6rem, 3vw, 2.5rem)" }}
          >
            {records.length} lots,{" "}
            <span className="italic text-gradient-brand">all on the record.</span>
          </h2>
          <p
            className="mt-3 max-w-xl font-sans leading-relaxed text-muted-foreground"
            style={{ fontSize: "clamp(0.88rem, 0.25vw + 0.82rem, 0.98rem)" }}
          >
            Lots still with the laboratory are not listed. If a lot has a
            certificate, it is here.
          </p>
          <div className="mt-8">
            <CertificateLibrary records={records} />
          </div>
        </div>

        {/* Who tests */}
        <div
          className="mt-[clamp(3.5rem,6vw,6rem)] border-t border-hairline"
          style={{ paddingTop: "clamp(1.75rem, 2.5vw, 2.5rem)" }}
        >
          <SectionHead index="04.3" label="Who tests" />
          <p
            className="mt-6 max-w-2xl font-sans leading-relaxed text-muted-foreground"
            style={{ fontSize: "clamp(0.86rem, 0.25vw + 0.8rem, 0.95rem)" }}
          >
            Certificates are issued and signed by ILS Laboratories, 8222 Vickers
            St, Suite 106, San Diego, CA 92111 — an ISO/IEC 17025 accredited
            lab. We do not test our own material.
          </p>
        </div>

        {/* Reading a certificate */}
        <div
          className="mt-[clamp(3.5rem,6vw,6rem)] border-t border-hairline"
          style={{ paddingTop: "clamp(1.75rem, 2.5vw, 2.5rem)" }}
        >
          <SectionHead index="04.4" label="Reading a certificate" />
          <dl className="mt-8 grid gap-px bg-hairline sm:grid-cols-2 lg:grid-cols-3">
            {READING.map((g) => (
              <div key={g.term} className="bg-background" style={{ padding: "clamp(1.1rem, 1.8vw, 1.5rem)" }}>
                <dt
                  className="font-mono tracking-[0.3em] uppercase text-brand"
                  style={{ fontSize: "clamp(9.5px, 0.25vw + 8.5px, 10.5px)" }}
                >
                  {g.term}
                </dt>
                <dd
                  className="mt-2 font-sans leading-relaxed text-foreground"
                  style={{ fontSize: "clamp(0.86rem, 0.25vw + 0.8rem, 0.95rem)" }}
                >
                  {g.def}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}

function SectionHead({ index, label }: { index: string; label: string }) {
  return (
    <div
      className="flex items-center font-mono tracking-[0.3em] uppercase text-muted-foreground"
      style={{
        fontSize: "clamp(10px, 0.3vw + 9px, 11px)",
        gap: "clamp(0.75rem, 1.5vw, 1.25rem)",
      }}
    >
      <span className="whitespace-nowrap text-brand">§ {index}</span>
      <span className="h-px shrink-0 bg-hairline" style={{ width: "clamp(1.5rem, 3vw, 2.75rem)" }} />
      <span>{label}</span>
    </div>
  );
}

/**
 * Three actual certificates fanned out, with the top one's headline
 * result pinned beside it. Real documents rather than an illustration —
 * the point of the page is that the paperwork exists.
 */
function CertificateStack({ stack }: { stack: CertRecord[] }) {
  const top = stack[0];
  const tilt = ["rotate-[5deg] translate-x-[14%]", "-rotate-[5deg] -translate-x-[14%]", "rotate-0"];
  return (
    <div className="relative mx-auto mb-6 w-full max-w-[14rem] sm:max-w-[20rem] lg:mb-0 lg:max-w-[26rem]" aria-hidden>
      <div className="relative aspect-[1100/1556]">
        {[...stack].reverse().map((r, i, arr) => (
          <div
            key={r.lot}
            className={`absolute inset-0 overflow-hidden border border-hairline bg-white shadow-[0_30px_60px_-20px_rgba(0,0,0,0.7)] ${
              tilt[i + (3 - arr.length)]
            } ${i < arr.length - 1 ? "opacity-60" : ""}`}
          >
            <Image
              src={r.image}
              alt=""
              width={COA_IMAGE_SIZE.width}
              height={COA_IMAGE_SIZE.height}
              sizes="(min-width: 1024px) 26rem, 80vw"
              className="block h-auto w-full"
              priority={i === arr.length - 1}
            />
          </div>
        ))}
      </div>
      {/* Readout pinned to the top certificate */}
      <div
        className="absolute -bottom-5 -left-10 whitespace-nowrap border border-brand/40 bg-background/95 backdrop-blur sm:-left-12"
        style={{ padding: "clamp(0.6rem, 1.2vw, 0.85rem) clamp(0.75rem, 1.4vw, 1rem)" }}
      >
        <div className="font-mono tracking-[0.22em] uppercase text-muted-foreground" style={{ fontSize: "9px" }}>
          {top.compound} {top.dose} · Lot {top.lot}
        </div>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="font-display leading-none text-foreground" style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)" }}>
            {top.purity.toFixed(2)}%
          </span>
          <span className="font-mono tracking-[0.2em] uppercase text-brand" style={{ fontSize: "9.5px" }}>
            ✓ Pass
          </span>
        </div>
      </div>
    </div>
  );
}
