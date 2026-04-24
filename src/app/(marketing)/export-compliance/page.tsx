import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Export compliance — PurePep Labs",
  description:
    "U.S. export-control and sanctions program governing international shipments from PurePep Labs, LLC. Template — review with counsel before launch.",
  alternates: { canonical: "/export-compliance" },
};

export default function ExportCompliancePage() {
  return (
    <>
      <div className="border-b border-heat/40 bg-heat/10 text-heat-foreground">
        <div
          className="mx-auto flex max-w-[var(--content-max)] items-center gap-3 pad-x py-3 font-mono tracking-[0.25em] uppercase text-heat"
          style={{ fontSize: "clamp(10px, 0.3vw + 9px, 11px)" }}
        >
          <span aria-hidden className="size-1.5 rounded-full bg-heat" />
          [Template — review with counsel before launch]
        </div>
      </div>

      <section className="relative border-b border-hairline">
        <div className="mx-auto w-full max-w-[var(--content-max)] pad-x section-y">
          <div className="max-w-2xl">
            <div
              className="flex items-center font-mono tracking-[0.3em] uppercase text-muted-foreground"
              style={{
                fontSize: "clamp(10px, 0.3vw + 9px, 11px)",
                gap: "clamp(0.75rem, 1.5vw, 1.25rem)",
              }}
            >
              <span className="whitespace-nowrap text-brand">§ 10</span>
              <span
                className="h-px shrink-0 bg-hairline"
                style={{ width: "clamp(1.5rem, 3vw, 2.75rem)" }}
              />
              <span>Legal</span>
            </div>
            <h1
              className="font-display leading-[0.95] tracking-[-0.02em]"
              style={{
                marginTop: "clamp(1rem, 1.5vw, 1.5rem)",
                fontSize: "clamp(2.25rem, 6.3vw, 6rem)",
              }}
            >
              Export{" "}
              <span className="italic text-gradient-brand">compliance.</span>
            </h1>
            <p
              className="mt-4 font-mono tracking-[0.25em] uppercase text-muted-foreground"
              style={{ fontSize: "clamp(9.5px, 0.25vw + 8.5px, 10.5px)" }}
            >
              Last updated: 2026-04-24
            </p>

            <div className="mt-12 space-y-10 font-sans leading-relaxed text-foreground/85">
              <Article
                eyebrow="01 · Governing authorities"
                title="EAR, BIS, and OFAC."
                paragraphs={[
                  "All international shipments from PurePep Labs are subject to the United States Export Administration Regulations (EAR) administered by the Bureau of Industry and Security (BIS), and to the economic sanctions programs administered by the Department of the Treasury's Office of Foreign Assets Control (OFAC). We classify each catalog item under its appropriate Export Control Classification Number (ECCN) prior to dispatch.",
                ]}
              />

              <Article
                eyebrow="02 · Prohibited destinations"
                title="Where we will not ship."
                paragraphs={[
                  "We do not ship to — and do not accept orders originating from — jurisdictions subject to comprehensive U.S. embargo or sanctions. As of the date above, that includes Cuba, Iran, North Korea, Syria, and the Crimea, so-called Donetsk People's Republic, and so-called Luhansk People's Republic regions of Ukraine.",
                  "This list is a non-exhaustive placeholder; the operative list at the time of any given shipment is the list maintained by OFAC. Orders bound for destinations added or removed from sanctions programs will be re-evaluated against the authorities in effect at dispatch.",
                ]}
              />

              <Article
                eyebrow="03 · End-user statement"
                title="Who receives the compound."
                paragraphs={[
                  "International purchasers must provide, at checkout, the legal name and address of the end-user institution, the name and role of the responsible researcher, and a one-sentence description of the intended research application. This statement becomes part of the export file for the shipment and must be accurate.",
                ]}
              />

              <Article
                eyebrow="04 · Denied-party screening"
                title="Every order, every party."
                paragraphs={[
                  "Each international order is screened against the U.S. Consolidated Screening List — which aggregates the Denied Persons List, Entity List, Unverified List, Specially Designated Nationals list, and related rosters — before payment is captured. Matches or near-matches suspend the order pending manual review by our compliance officer.",
                ]}
              />

              <Article
                eyebrow="05 · End-use restrictions"
                title="Weapons, WMD, dual-use diversion."
                paragraphs={[
                  "Compounds sold by PurePep Labs may not be used in the design, development, production, or use of chemical, biological, or nuclear weapons, missiles or unmanned aerial vehicles, or in support of any military end-use in a destination subject to an applicable end-use restriction.",
                ]}
              />

              <Article
                eyebrow="06 · Purchaser responsibilities"
                title="You are the exporter of record."
                paragraphs={[
                  "For shipments bound outside the United States, the purchaser is the exporter of record under U.S. law and is responsible for import licensing, customs clearance, duties, and any applicable domestic restrictions in the destination jurisdiction. We can provide a commercial invoice and a harmonised tariff code; we cannot act as importer of record.",
                ]}
              />

              <Article
                eyebrow="07 · Non-compliance"
                title="Violations are referred."
                paragraphs={[
                  "Attempted violations of this policy — including misrepresentation of destination, end-user, or intended application — are grounds for immediate order cancellation, revocation of the researcher's account, and, where warranted, referral to the appropriate federal authority. We cooperate with governmental inquiries to the extent required by law.",
                ]}
              />

              <Article
                eyebrow="08 · Contact"
                title="Compliance Officer."
                paragraphs={[
                  "Inquiries regarding export classification, licensing, or the screening process may be directed to: Compliance Officer, PurePep Labs, LLC, [street address], Houston, Texas [ZIP], United States, or compliance@[placeholder-domain].",
                ]}
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function Article({
  eyebrow,
  title,
  paragraphs,
}: {
  eyebrow: string;
  title: string;
  paragraphs: string[];
}) {
  return (
    <article className="border-t border-hairline pt-8">
      <h2
        className="font-mono tracking-[0.25em] uppercase text-brand"
        style={{ fontSize: "clamp(9.5px, 0.25vw + 8.5px, 10.5px)" }}
      >
        {eyebrow}
      </h2>
      <p
        className="mt-3 font-display italic leading-snug text-foreground"
        style={{ fontSize: "clamp(1.15rem, 1.5vw, 1.5rem)" }}
      >
        {title}
      </p>
      <div className="mt-4 space-y-4">
        {paragraphs.map((p, i) => (
          <p key={i} className="text-[0.95rem] text-foreground/80">
            {p}
          </p>
        ))}
      </div>
    </article>
  );
}
