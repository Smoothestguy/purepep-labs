import Link from "next/link";
import { NewsletterForm } from "./newsletter-form";

type FooterLink = { href: string; label: string };

const columns: { title: string; links: FooterLink[] }[] = [
  {
    title: "Catalog",
    links: [
      { href: "/shop?category=regenerative", label: "Regenerative" },
      { href: "/shop?category=metabolic", label: "Metabolic" },
      { href: "/shop?category=nootropic", label: "Nootropic" },
      { href: "/shop?category=longevity", label: "Longevity" },
      { href: "/shop", label: "All compounds" },
    ],
  },
  {
    title: "Documentation",
    links: [
      { href: "/coa", label: "Certificates of analysis" },
      { href: "/#science", label: "Synthesis protocol" },
      { href: "/coa", label: "Stability data" },
      { href: "/coa", label: "Batch archive" },
    ],
  },
  {
    title: "Laboratory",
    links: [
      { href: "/#science", label: "About the facility" },
      { href: "mailto:press@purepeplabs.com", label: "Press" },
      { href: "mailto:research@purepeplabs.com", label: "Research partners" },
      { href: "mailto:hello@purepeplabs.com", label: "Contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/terms", label: "Terms of sale" },
      { href: "/research-use", label: "Research-use policy" },
      { href: "/privacy", label: "Privacy" },
      { href: "/export-compliance", label: "Export compliance" },
    ],
  },
];

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden border-t border-hairline bg-background">
      <div
        className="mx-auto w-full max-w-[var(--content-max)] pad-x"
        style={{
          paddingTop: "clamp(3rem, 6vw, 6rem)",
          paddingBottom: "clamp(1rem, 2vw, 2rem)",
        }}
      >
        <div
          className="flex flex-col border-b border-hairline lg:flex-row lg:items-end lg:justify-between"
          style={{
            gap: "clamp(1.75rem, 3vw, 3rem)",
            paddingBottom: "clamp(2.5rem, 4vw, 4rem)",
          }}
        >
          <div className="max-w-2xl">
            <div className="section-eyebrow">
              <span className="whitespace-nowrap text-brand">§ 06</span>
              <span className="h-px shrink-0 bg-hairline" style={{ width: "clamp(1.5rem, 3vw, 2.75rem)" }} />
              <span>Correspondence</span>
            </div>
            <h2
              className="display-md"
              style={{ marginTop: "clamp(1rem, 1.5vw, 1.5rem)" }}
            >
              The monograph,
              <br />
              <span className="italic text-gradient-brand">monthly.</span>
            </h2>
            <p
              className="max-w-md font-sans leading-relaxed text-muted-foreground"
              style={{
                marginTop: "clamp(0.75rem, 1.2vw, 1.25rem)",
                fontSize: "clamp(0.85rem, 0.3vw + 0.77rem, 0.95rem)",
              }}
            >
              New compounds, stability updates, and the occasional essay from
              the bench. One dispatch per month. No marketing.
            </p>
          </div>

          <NewsletterForm />
        </div>

        <div
          className="grid grid-cols-2 md:grid-cols-4"
          style={{
            columnGap: "clamp(1.25rem, 2vw, 2rem)",
            rowGap: "clamp(2rem, 3.5vw, 3rem)",
            paddingTop: "clamp(2.5rem, 4vw, 4rem)",
          }}
        >
          {columns.map((c) => (
            <div key={c.title}>
              <h3 className="eyebrow tracking-[0.3em] text-muted-foreground">
                {c.title}
              </h3>
              <ul className="mt-4 space-y-3 sm:mt-5">
                {c.links.map((l) => (
                  <li key={`${c.title}-${l.label}`}>
                    <Link
                      href={l.href}
                      className="font-sans text-sm text-foreground/80 transition-colors hover:text-brand"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div
          className="flex flex-col border-t border-hairline font-mono tracking-[0.25em] uppercase text-muted-foreground sm:flex-row sm:items-center sm:justify-between"
          style={{
            marginTop: "clamp(3rem, 5vw, 5rem)",
            paddingTop: "clamp(1.25rem, 2vw, 1.75rem)",
            gap: "0.5rem",
            fontSize: "clamp(9.5px, 0.25vw + 8.5px, 10.5px)",
          }}
        >
          <div>© {year} PurePep Labs, LLC · Houston, TX</div>
          <div>For research use only · Not for human consumption</div>
        </div>

        <div className="mt-6 overflow-hidden">
          <div
            aria-hidden
            className="whitespace-nowrap font-display leading-[0.82] tracking-[-0.06em] text-gradient-brand"
            style={{ fontSize: "clamp(3.5rem, 18vw, 22rem)" }}
          >
            PUREPEP<span className="italic font-light opacity-80">·</span>LABS
          </div>
        </div>
      </div>
    </footer>
  );
}
