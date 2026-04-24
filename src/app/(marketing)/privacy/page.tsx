import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy policy — PurePep Labs",
  description:
    "How PurePep Labs, LLC collects, uses, and retains researcher and order data. Template — review with counsel before launch.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
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
              <span className="whitespace-nowrap text-brand">§ 08</span>
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
              Privacy <span className="italic text-gradient-brand">policy.</span>
            </h1>
            <p
              className="mt-4 font-mono tracking-[0.25em] uppercase text-muted-foreground"
              style={{ fontSize: "clamp(9.5px, 0.25vw + 8.5px, 10.5px)" }}
            >
              Last updated: 2026-04-24
            </p>

            <div className="mt-12 space-y-10 font-sans leading-relaxed text-foreground/85">
              <Article
                eyebrow="01 · Data we collect"
                title="Contact, order, institution."
                paragraphs={[
                  "When you create a researcher account or place an order, we collect a limited set of identifying data: full name, institutional affiliation, business email, shipping address, and contact telephone. For orders that ship internationally, we additionally capture the end-user's stated research purpose and the institution's registered jurisdiction.",
                  "Payment card numbers are processed directly by our payment gateway; our servers never store the primary account number, expiration, or security code — only a tokenised reference for dispute and reconciliation.",
                ]}
              />

              <Article
                eyebrow="02 · How we use it"
                title="Fulfilment, compliance, correspondence."
                paragraphs={[
                  "Your data is used to fulfil orders, generate Certificates of Analysis, satisfy export-control obligations, respond to your inquiries, and — if you have opted in — to send occasional laboratory correspondence. We do not sell personal data. We do not rent, license, or trade mailing lists.",
                ]}
              />

              <Article
                eyebrow="03 · Cookies & telemetry"
                title="Functional only, by default."
                paragraphs={[
                  "The site uses a small number of first-party cookies to persist your session, your cart contents, and your age-attestation. Anonymous aggregate analytics are captured to understand how researchers discover and move through the catalog; no individual is identified in these reports. You may block non-essential cookies through your browser without loss of core functionality.",
                ]}
              />

              <Article
                eyebrow="04 · Third parties"
                title="Payment, analytics, freight."
                paragraphs={[
                  "We share the minimum necessary data with vetted sub-processors: a payment gateway (to authorise and settle transactions), an analytics provider (aggregate-only), and contracted freight carriers (name, address, and phone number, strictly for delivery). A current list of sub-processors is available on request.",
                ]}
              />

              <Article
                eyebrow="05 · Retention"
                title="As long as we must, no longer."
                paragraphs={[
                  "Order records and shipment logs are retained for seven years to satisfy tax and export-control recordkeeping obligations. Researcher account data is retained for the active life of the account plus twenty-four months, after which it is purged or anonymised. Backup archives roll off on a quarterly cadence.",
                ]}
              />

              <Article
                eyebrow="06 · Your rights"
                title="CCPA, GDPR, and plain English."
                paragraphs={[
                  "Residents of California and the European Economic Area have specific statutory rights to access, correct, port, and delete their personal data, and to object to certain processing. We honour these rights for all researchers regardless of jurisdiction, subject only to the retention obligations noted above.",
                  "To exercise any right, write to the contact address below. We will acknowledge receipt within seven business days and respond substantively within thirty.",
                ]}
              />

              <Article
                eyebrow="07 · Security"
                title="Encryption, principle of least privilege."
                paragraphs={[
                  "Data in transit is protected by TLS 1.3. Data at rest is encrypted with industry-standard ciphers. Access to production systems is restricted to named personnel under multi-factor authentication and reviewed quarterly. We disclose material data incidents to affected researchers without undue delay.",
                ]}
              />

              <Article
                eyebrow="08 · Contact"
                title="Write to the laboratory."
                paragraphs={[
                  "Questions, requests, or complaints may be directed to: PurePep Labs, LLC — Privacy Office, [street address], Houston, Texas [ZIP], United States, or privacy@[placeholder-domain].",
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
