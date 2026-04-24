import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Research-use policy — PurePep Labs",
  description:
    "The attestations and restrictions that govern purchase of compounds from PurePep Labs. Template — review with counsel before launch.",
  alternates: { canonical: "/research-use" },
};

export default function ResearchUsePage() {
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
              <span className="whitespace-nowrap text-brand">§ 09</span>
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
              Research-use{" "}
              <span className="italic text-gradient-brand">policy.</span>
            </h1>
            <p
              className="mt-4 font-mono tracking-[0.25em] uppercase text-muted-foreground"
              style={{ fontSize: "clamp(9.5px, 0.25vw + 8.5px, 10.5px)" }}
            >
              Last updated: 2026-04-24
            </p>

            <div className="mt-12 space-y-10 font-sans leading-relaxed text-foreground/85">
              <Article
                eyebrow="01 · Attestation recap"
                title="What you agreed to at the gate."
                paragraphs={[
                  "Every visitor entering this site affirms three statements: that they are at least twenty-one years of age; that they are a qualified researcher, clinician, or educator; and that they will not administer the compounds offered here to humans or animals. That attestation is the foundation on which every sale rests.",
                  "This policy restates those commitments in long form, adds the prohibited uses we will not support, and describes how we respond when the policy is breached.",
                ]}
              />

              <Article
                eyebrow="02 · Prohibited uses"
                title="Humans, animals, resale, re-export."
                paragraphs={[
                  "Compounds dispatched by PurePep Labs must not be administered to human subjects, including the purchaser or consenting adults. They must not be administered to vertebrate or invertebrate animals outside a protocol approved by a recognised institutional review or animal-care committee.",
                  "Compounds must not be resold, redistributed, relabelled, or combined into finished preparations for any third party. Re-export outside the country of delivery without written consent from PurePep Labs is strictly prohibited and may constitute a separate violation of U.S. export law.",
                ]}
              />

              <Article
                eyebrow="03 · Representations you make"
                title="Every order, every time."
                paragraphs={[
                  "By completing a purchase you represent, for that order and each subsequent order, that the prohibited uses above will not occur, that the compound will be stored and handled in a laboratory setting appropriate to its chemical profile, and that all applicable institutional, local, and national regulations will be observed.",
                ]}
              />

              <Article
                eyebrow="04 · Enforcement"
                title="How we find out, what we do."
                paragraphs={[
                  "We monitor publicly available signals — social media, marketplace listings, discussion forums — for evidence that lot-traceable compounds have been diverted to prohibited uses. Independently developed signatures embedded in certain lots allow us to trace samples back to the originating shipment.",
                  "Where a violation is established, we may: cancel open orders; revoke the researcher's account; withhold outstanding refunds where permissible; and, in cases involving human administration, notify relevant regulatory authorities.",
                ]}
              />

              <Article
                eyebrow="05 · Termination for misuse"
                title="Account revocation is permanent."
                paragraphs={[
                  "Accounts terminated for cause under this policy are not restored. The identifying data associated with a terminated account is retained for the period required under our Privacy Policy and may be flagged to prevent the creation of duplicate accounts under related identifiers.",
                ]}
              />

              <Article
                eyebrow="06 · Reporting"
                title="If you suspect misuse."
                paragraphs={[
                  "If you believe a PurePep Labs compound is being diverted, relabelled, or administered outside laboratory research, write to research-integrity@[placeholder-domain]. Reports may be submitted anonymously. Credible information is reviewed by the laboratory director within three business days.",
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
