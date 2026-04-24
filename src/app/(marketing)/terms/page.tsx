import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of sale — PurePep Labs",
  description:
    "Terms governing the sale of research compounds by PurePep Labs, LLC. Template — review with counsel before launch.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
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
              <span className="whitespace-nowrap text-brand">§ 07</span>
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
              Terms of <span className="italic text-gradient-brand">sale.</span>
            </h1>
            <p
              className="mt-4 font-mono tracking-[0.25em] uppercase text-muted-foreground"
              style={{ fontSize: "clamp(9.5px, 0.25vw + 8.5px, 10.5px)" }}
            >
              Last updated: 2026-04-24
            </p>

            <div className="mt-12 space-y-10 font-sans leading-relaxed text-foreground/85">
              <Article
                eyebrow="01 · Eligibility"
                title="Who may purchase."
                paragraphs={[
                  "PurePep Labs sells laboratory compounds only to individuals aged twenty-one years or older who identify themselves as qualified researchers, clinicians, or academic-affiliated personnel. By placing an order, you represent that you meet these requirements and that your intended use is confined to in-vitro, pre-clinical, or instrumentation-calibration contexts.",
                  "We reserve the right to decline or cancel any order at our sole discretion, including after payment has been authorised, where eligibility cannot be substantiated.",
                ]}
              />

              <Article
                eyebrow="02 · License granted"
                title="What you are buying."
                paragraphs={[
                  "Each purchase constitutes a limited, non-transferable license to use the delivered compound for laboratory research purposes only. No rights are granted to resell, re-export, relabel, or otherwise commercialise the compound. Any distribution to third parties — whether commercial or gratis — voids the license and any associated warranty.",
                ]}
              />

              <Article
                eyebrow="03 · Shipping"
                title="Dispatch and transit."
                paragraphs={[
                  "Domestic orders ship from Houston, Texas via temperature-monitored carriers. Transit times are estimates, not guarantees. Title and risk of loss pass to the purchaser upon the carrier's acceptance of the consignment. Signature is required on delivery unless explicitly waived in writing.",
                  "International orders are subject to the Export Compliance policy and may be delayed by customs review. We do not ship to jurisdictions subject to comprehensive U.S. sanctions.",
                ]}
              />

              <Article
                eyebrow="04 · Returns"
                title="Research chemicals are final sale."
                paragraphs={[
                  "Due to the nature of research-grade compounds, no returns, exchanges, or refunds are offered once a consignment has shipped. Should a shipment arrive visibly compromised — broken seal, evidence of thermal excursion, or documented carrier mishandling — notify the laboratory within seventy-two hours of delivery to open a replacement claim.",
                  "Replacement claims are resolved at our sole discretion following internal review of the affected lot, and may require return of the compromised vial for forensic purposes.",
                ]}
              />

              <Article
                eyebrow="05 · Payment"
                title="Authorisation and currency."
                paragraphs={[
                  "All prices are quoted in United States dollars. Payment is processed by a third-party gateway at the time of order. You authorise us to charge the payment instrument for the full order total, including freight and any applicable taxes or duties. Declined authorisations cancel the order in full.",
                ]}
              />

              <Article
                eyebrow="06 · Governing law"
                title="Texas, unless otherwise compelled."
                paragraphs={[
                  "These Terms are governed by the laws of the State of Texas, without regard to conflict-of-laws principles. The federal and state courts located in Harris County, Texas shall have exclusive jurisdiction over any dispute arising from or related to these Terms, save where arbitration is elected below.",
                ]}
              />

              <Article
                eyebrow="07 · Dispute resolution"
                title="Arbitration, at either party's option."
                paragraphs={[
                  "Either party may elect to resolve any dispute under these Terms through binding arbitration administered by a mutually agreed commercial arbitrator in Houston, Texas, conducted in English. The arbitrator's decision shall be final and enforceable in any court of competent jurisdiction. Class actions and class-wide arbitration are expressly waived.",
                ]}
              />

              <Article
                eyebrow="08 · Severability"
                title="One clause falls, the rest stand."
                paragraphs={[
                  "If any provision of these Terms is held unenforceable by a court or arbitrator, the remaining provisions shall continue in full force and effect, and the unenforceable provision shall be modified to the minimum extent necessary to render it enforceable while preserving the parties' intent.",
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
