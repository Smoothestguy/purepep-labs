import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  compounds,
  compoundBySlug,
  slugify,
  type Compound,
} from "@/lib/compounds";
import { ProductCard } from "@/components/shop/product-card";
import { ProductGrid } from "@/components/shop/product-grid";
import { BuyButton } from "@/components/shop/buy-button";
import { CompoundVial } from "@/components/shop/compound-vial";

type Params = Promise<{ slug: string }>;

export function generateStaticParams() {
  return compounds.map((c) => ({ slug: slugify(c.name) }));
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const compound = compoundBySlug(slug);
  if (!compound) {
    return {
      title: "Not found — PurePep Labs",
    };
  }
  const description = `${compound.blurb} · ${compound.molecularWeight} g/mol · ${compound.purity}% HPLC-MS purity · ${compound.dose} fill. For laboratory research use only.`;
  const title = `${compound.name} — PurePep Labs`;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
    },
  };
}

/**
 * Per-compound editorial body. Hand-tuned per category to stay honest and
 * avoid efficacy claims — we're describing synthesis, QC, and handling, not
 * mechanism of action in vivo.
 */
function monographParagraphs(c: Compound): string[] {
  const families: Record<Compound["category"], string[]> = {
    regenerative: [
      `${c.blurb} Isolated for its structural simplicity and synthetic accessibility, ${c.name} is produced as a lyophilised solid and sealed under inert atmosphere.`,
      `Every batch moves through the full Six-Step protocol — solid-phase Fmoc synthesis, TFA cleavage, reverse-phase HPLC purification, and ESI-TOF mass-spec confirmation. The lot shipped carries ≥ ${c.purity}% HPLC-MS purity with residual solvent and endotoxin assays signed by an independent laboratory.`,
      `Store the unreconstituted vial at −20 °C. After reconstitution into bacteriostatic water, keep refrigerated and use within four weeks. Do not refreeze.`,
    ],
    metabolic: [
      `${c.blurb} ${c.name} belongs to the ${c.family.toLowerCase()} class and is prepared at a ${c.dose} fill per vial for laboratory titration work.`,
      `Material is synthesised on Rink-amide resin, cleaved with a standard TFA/TIPS/water cocktail, and purified on a C18 column to ≥ ${c.purity}%. Mass confirmation (ESI-TOF) and residual-solvent GC accompany every lot. Third-party counter-assay is run on a blind aliquot before release.`,
      `Long-chain GHRH and mitochondrial-derived peptides are moisture-sensitive; keep frozen at −20 °C, thaw once, and protect from repeated freeze-thaw cycles.`,
    ],
    nootropic: [
      `${c.blurb} ${c.name} is a short ${c.family.toLowerCase()} presented as a freeze-dried solid with amber-glass packaging and argon-flushed headspace.`,
      `Synthesis uses Fmoc solid-phase chemistry with HBTU activation; crude peptide is precipitated in cold ether and polished by reverse-phase HPLC until purity floors at ${c.purity}%. Every lot leaves the bench with ESI-TOF, LAL endotoxin, and residual-solvent data attached.`,
      `Store frozen at −20 °C. Reconstituted solutions are stable refrigerated for up to two weeks; thaw once and avoid repeated freeze-thaw cycles.`,
    ],
    longevity: [
      `${c.blurb} ${c.name} is supplied as a lyophilised solid at a ${c.dose} fill, sealed in amber borosilicate with an argon headspace.`,
      `Our Six-Step protocol applies identically to tripeptides and tetrapeptides: SPPS synthesis, HPLC purification to ≥ ${c.purity}%, and ESI-TOF mass confirmation. Copper complexes additionally pass a UV-vis coordination check. Every lot ships with a CoA signed by a third-party analytical lab.`,
      `Keep at −20 °C until reconstitution. Short peptides are robust once dry, but once in solution, refrigerate and use within four weeks.`,
    ],
  };
  return families[c.category];
}

export default async function ProductPage({
  params,
}: {
  params: Params;
}) {
  const { slug } = await params;
  const compound = compoundBySlug(slug);
  if (!compound) notFound();

  const paragraphs = monographParagraphs(compound);

  // Related: same category minus self; pad with newest from other categories
  // to always offer 3 suggestions.
  const sameCategory = compounds.filter(
    (c) => c.category === compound.category && c.accession !== compound.accession,
  );
  const related: Compound[] = [...sameCategory];
  if (related.length < 3) {
    const fillers = compounds
      .filter(
        (c) =>
          c.category !== compound.category && c.accession !== compound.accession,
      )
      .slice()
      .reverse();
    for (const c of fillers) {
      if (related.length >= 3) break;
      related.push(c);
    }
  }
  const relatedDisplay = related.slice(0, 3);

  return (
    <>
      <section className="relative border-b border-hairline">
        <div
          className="mx-auto grid w-full max-w-[var(--content-max)] grid-cols-1 pad-x section-y lg:grid-cols-12"
          style={{
            columnGap: "clamp(1.5rem, 3vw, 3rem)",
            rowGap: "clamp(2.5rem, 5vw, 4rem)",
          }}
        >
          {/* LEFT — monograph */}
          <div className="lg:col-span-7">
            <div
              className="flex items-center font-mono tracking-[0.3em] uppercase text-muted-foreground"
              style={{
                fontSize: "clamp(10px, 0.3vw + 9px, 11px)",
                gap: "clamp(0.75rem, 1.5vw, 1.25rem)",
              }}
            >
              <span className="whitespace-nowrap text-brand">
                § {compound.accession}
              </span>
              <span
                className="h-px shrink-0 bg-hairline"
                style={{ width: "clamp(1.5rem, 3vw, 2.75rem)" }}
              />
              <span>{compound.family}</span>
            </div>

            <h1
              className="font-display leading-[0.9] tracking-[-0.03em] text-foreground"
              style={{
                marginTop: "clamp(1.25rem, 2vw, 2rem)",
                fontSize: "clamp(3rem, 9vw, 7rem)",
              }}
            >
              {compound.name}
            </h1>
            <p
              className="font-display italic leading-tight tracking-tight text-muted-foreground"
              style={{
                marginTop: "clamp(0.85rem, 1.2vw, 1.25rem)",
                fontSize: "clamp(1.2rem, 2.2vw, 2rem)",
              }}
            >
              {compound.codename}
            </p>

            {/* Body paragraphs */}
            <div
              className="max-w-2xl"
              style={{
                marginTop: "clamp(1.75rem, 3vw, 2.75rem)",
                display: "flex",
                flexDirection: "column",
                gap: "clamp(1rem, 1.6vw, 1.4rem)",
              }}
            >
              {paragraphs.map((p, i) => (
                <p
                  key={i}
                  className="font-sans leading-relaxed text-muted-foreground"
                  style={{
                    fontSize: "clamp(0.95rem, 0.4vw + 0.85rem, 1.125rem)",
                  }}
                >
                  {p}
                </p>
              ))}
            </div>

            {/* Data list */}
            <dl
              className="grid grid-cols-1 border-t border-hairline sm:grid-cols-2"
              style={{
                marginTop: "clamp(2.5rem, 4vw, 3.5rem)",
                paddingTop: "clamp(1.25rem, 2vw, 1.75rem)",
                columnGap: "clamp(1rem, 2vw, 2rem)",
                rowGap: "clamp(1rem, 1.5vw, 1.25rem)",
              }}
            >
              {[
                {
                  k: "Sequence",
                  v: (
                    <span className="break-all font-mono text-foreground">
                      {compound.sequence}
                    </span>
                  ),
                },
                {
                  k: "Molecular weight",
                  v: (
                    <span className="font-mono text-foreground">
                      {compound.molecularWeight} g/mol
                    </span>
                  ),
                },
                {
                  k: "Purity (HPLC-MS)",
                  v: (
                    <span className="font-mono text-brand">
                      {compound.purity}%
                    </span>
                  ),
                },
                {
                  k: "Dose · fill",
                  v: (
                    <span className="font-mono text-foreground">
                      {compound.dose}
                    </span>
                  ),
                },
                {
                  k: "Lot number",
                  v: (
                    <span className="font-mono text-foreground">
                      {compound.lot}
                    </span>
                  ),
                },
                {
                  k: "CoA date",
                  v: (
                    <span className="font-mono text-foreground">
                      {compound.coaDate}
                    </span>
                  ),
                },
                {
                  k: "Storage",
                  v: (
                    <span className="font-mono text-foreground">
                      −20 °C · thaw once
                    </span>
                  ),
                },
                {
                  k: "Shipping",
                  v: (
                    <span className="font-mono text-foreground">
                      Cold-chain, 1-day overnight
                    </span>
                  ),
                },
              ].map((row) => (
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

            {/* Doc links */}
            <div
              className="flex flex-wrap items-center"
              style={{
                marginTop: "clamp(2rem, 3vw, 3rem)",
                gap: "clamp(0.65rem, 1.2vw, 1rem)",
              }}
            >
              <Link
                href="/coa"
                className="group inline-flex items-center gap-3 whitespace-nowrap border border-hairline font-mono tracking-[0.3em] uppercase text-foreground transition-colors hover:border-foreground"
                style={{
                  paddingInline: "clamp(1.1rem, 1.8vw, 1.6rem)",
                  paddingBlock: "clamp(0.75rem, 1vw, 1rem)",
                  fontSize: "clamp(10px, 0.3vw + 9px, 11px)",
                }}
              >
                <span className="size-1.5 rounded-full bg-brand" />
                View Certificate of Analysis
              </Link>
              <Link
                href="/#science"
                className="group inline-flex items-center gap-3 whitespace-nowrap border border-hairline font-mono tracking-[0.3em] uppercase text-foreground transition-colors hover:border-foreground"
                style={{
                  paddingInline: "clamp(1.1rem, 1.8vw, 1.6rem)",
                  paddingBlock: "clamp(0.75rem, 1vw, 1rem)",
                  fontSize: "clamp(10px, 0.3vw + 9px, 11px)",
                }}
              >
                Synthesis protocol
                <span className="transition-transform group-hover:translate-x-1">
                  →
                </span>
              </Link>
            </div>
          </div>

          {/* RIGHT — vial + specs + buy */}
          <div className="lg:col-span-5">
            <div
              className="lg:sticky"
              style={{
                top: "clamp(5rem, 8vw, 7rem)",
                display: "flex",
                flexDirection: "column",
                gap: "clamp(1.25rem, 2vw, 1.75rem)",
              }}
            >
              <CompoundVial compound={compound} />

              {/* Data sheet card */}
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
                    { k: "Lot", v: compound.lot },
                    { k: "Dose", v: compound.dose },
                    {
                      k: "In stock",
                      v: `${compound.inStock} vials`,
                    },
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
                    style={{
                      fontSize: "clamp(9.5px, 0.25vw + 8.5px, 10.5px)",
                    }}
                  >
                    Price
                  </div>
                  <div
                    className="flex items-baseline gap-1 font-display leading-none tracking-tight text-foreground"
                    style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)" }}
                  >
                    <span
                      className="font-mono tracking-[0.25em] uppercase text-muted-foreground"
                      style={{
                        fontSize: "clamp(10px, 0.25vw + 9px, 11px)",
                      }}
                    >
                      USD
                    </span>
                    <span>${compound.price}</span>
                  </div>
                </div>

                <div style={{ marginTop: "clamp(1.1rem, 1.5vw, 1.4rem)" }}>
                  <BuyButton compound={compound} />
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
            </div>
          </div>
        </div>
      </section>

      {/* Related monographs */}
      <section className="relative border-b border-hairline bg-background">
        <div
          className="mx-auto w-full max-w-[var(--content-max)] pad-x"
          style={{
            paddingTop: "clamp(3rem, 5vw, 5rem)",
            paddingBottom: "clamp(3rem, 5vw, 5rem)",
          }}
        >
          <div
            className="flex items-center font-mono tracking-[0.3em] uppercase text-muted-foreground"
            style={{
              fontSize: "clamp(10px, 0.3vw + 9px, 11px)",
              gap: "clamp(0.75rem, 1.5vw, 1.25rem)",
            }}
          >
            <span className="whitespace-nowrap text-brand">§ 03</span>
            <span
              className="h-px shrink-0 bg-hairline"
              style={{ width: "clamp(1.5rem, 3vw, 2.75rem)" }}
            />
            <span>Related monographs</span>
          </div>
          <h2
            className="font-display leading-[0.95] tracking-[-0.02em]"
            style={{
              marginTop: "clamp(0.85rem, 1.4vw, 1.25rem)",
              marginBottom: "clamp(1.75rem, 3vw, 2.5rem)",
              fontSize: "clamp(1.75rem, 4vw, 3.5rem)",
            }}
          >
            Adjacent entries
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3" style={{ gap: "clamp(0.75rem, 1.2vw, 1.25rem)" }}>
            {relatedDisplay.map((c) => (
              <ProductCard key={c.accession} compound={c} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
