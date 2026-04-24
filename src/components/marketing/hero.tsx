import Link from "next/link";

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-hairline">
      {/* Faint technical grid */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgb(255 255 255 / 0.5) 1px, transparent 1px), linear-gradient(to bottom, rgb(255 255 255 / 0.5) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
          maskImage:
            "radial-gradient(ellipse at 30% 40%, black 30%, transparent 75%)",
        }}
      />
      {/* Soft brand glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 right-[-10%] size-[min(680px,80vw)] rounded-full opacity-[0.22] blur-3xl"
        style={{
          background:
            "radial-gradient(closest-side, var(--brand) 0%, transparent 70%)",
        }}
      />

      <div
        className="relative mx-auto grid w-full max-w-[var(--content-max)] grid-cols-1 pad-x xl:grid-cols-12 items-start"
        style={{
          paddingTop: "clamp(3rem, 6vw + 1rem, 8rem)",
          paddingBottom: "clamp(4rem, 7vw + 1rem, 9rem)",
          gap: "clamp(2.5rem, 4vw, 3.5rem)",
        }}
      >
        {/* LEFT — editorial copy */}
        <div className="relative z-10 flex flex-col xl:col-span-8 2xl:col-span-7">
          {/* Section code */}
          <div className="section-eyebrow">
            <span className="whitespace-nowrap text-brand">§ 01</span>
            <span
              className="h-px shrink-0 bg-hairline"
              style={{ width: "clamp(1.5rem, 3vw, 2.75rem)" }}
            />
            <span className="whitespace-nowrap">
              Index Vol. XII · Spring ’26
            </span>
          </div>

          {/* Headline */}
          <h1
            className="display-hero text-foreground"
            style={{ marginTop: "clamp(1.75rem, 3vw, 3rem)" }}
          >
            <span className="block italic font-light">Research-grade</span>
            <span className="block">peptides,</span>
            <span className="block text-muted-foreground">documented to</span>
            <span className="block">
              the <span className="italic text-gradient-brand">milligram.</span>
            </span>
          </h1>

          {/* Lede */}
          <p
            className="max-w-xl body-lede"
            style={{ marginTop: "clamp(1.75rem, 3vw, 2.5rem)" }}
          >
            Every vial is HPLC-verified, lot-traceable, and shipped with a
            third-party Certificate of Analysis. No proprietary blends. No
            mystery excipients. Just the compound, documented.
          </p>

          {/* CTAs */}
          <div
            className="flex flex-wrap items-center"
            style={{
              marginTop: "clamp(1.75rem, 3vw, 2.5rem)",
              gap: "clamp(0.65rem, 1.2vw, 1rem)",
            }}
          >
            <Link
              href="#catalog"
              className="group inline-flex items-center gap-3 whitespace-nowrap bg-brand font-mono tracking-[0.3em] uppercase text-brand-foreground transition-all hover:shadow-[0_0_0_4px_oklch(0.82_0.15_210_/_0.18)]"
              style={{
                paddingInline: "clamp(1.1rem, 1.8vw, 1.6rem)",
                paddingBlock: "clamp(0.75rem, 1vw, 1rem)",
                fontSize: "clamp(10px, 0.3vw + 9px, 11px)",
              }}
            >
              Enter catalog
              <span className="transition-transform group-hover:translate-x-1">
                →
              </span>
            </Link>
            <Link
              href="#coa"
              className="group inline-flex items-center gap-3 whitespace-nowrap border border-hairline font-mono tracking-[0.3em] uppercase text-foreground transition-colors hover:border-foreground"
              style={{
                paddingInline: "clamp(1.1rem, 1.8vw, 1.6rem)",
                paddingBlock: "clamp(0.75rem, 1vw, 1rem)",
                fontSize: "clamp(10px, 0.3vw + 9px, 11px)",
              }}
            >
              <span className="size-1.5 rounded-full bg-brand" />
              View documentation
            </Link>
          </div>

          {/* Technical data row */}
          <dl
            className="grid grid-cols-3 border-t border-hairline"
            style={{
              marginTop: "clamp(2.5rem, 4.5vw, 4.5rem)",
              paddingTop: "clamp(1.25rem, 2vw, 1.75rem)",
              columnGap: "clamp(1rem, 2vw, 2rem)",
            }}
          >
            {[
              { k: "One compound", v: "Per vial", sub: "Never a blend" },
              { k: "A CoA", v: "With every lot", sub: "Third-party signed" },
              { k: "Two labs", v: "Cross-assayed", sub: "Independently" },
            ].map((s) => (
              <div key={s.k}>
                <dt className="font-mono tracking-[0.25em] uppercase text-muted-foreground" style={{ fontSize: "clamp(9.5px, 0.25vw + 8.5px, 10.5px)" }}>
                  {s.k}
                </dt>
                <dd
                  className="font-display leading-none tracking-tight text-foreground"
                  style={{
                    marginTop: "clamp(0.4rem, 0.6vw, 0.6rem)",
                    fontSize: "clamp(1.75rem, 2.8vw, 2.75rem)",
                  }}
                >
                  {s.v}
                </dd>
                <dd
                  className="font-mono tracking-[0.2em] uppercase text-muted-foreground"
                  style={{
                    marginTop: "clamp(0.2rem, 0.3vw, 0.35rem)",
                    fontSize: "clamp(9.5px, 0.25vw + 8.5px, 10.5px)",
                  }}
                >
                  {s.sub}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* RIGHT — vial cinema */}
        <div className="relative xl:col-span-4 2xl:col-span-5">
          <div className="relative aspect-[4/5] w-full overflow-hidden border border-hairline bg-surface">
            <CornerTicks />

            <video
              className="absolute inset-0 h-full w-full object-cover"
              autoPlay
              muted
              loop
              playsInline
              poster="/videos/purepep-vial-poster.jpg"
              style={{ filter: "contrast(1.08) saturate(1.05)" }}
            >
              <source src="/videos/purepep-vial.mp4" type="video/mp4" />
            </video>

            {/* Vignette — hides the vial render's transparency checkerboard */}
            <div
              aria-hidden
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(ellipse 55% 70% at 50% 50%, transparent 0%, oklch(0.17 0.02 250 / 0.45) 55%, oklch(0.13 0.01 250 / 0.95) 100%)",
              }}
            />
            <div
              aria-hidden
              className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-background via-background/60 to-transparent"
            />

            <div
              className="absolute left-[clamp(0.5rem,1vw,1rem)] top-[clamp(0.5rem,1vw,1rem)] font-mono tracking-[0.22em] uppercase text-foreground"
              style={{ fontSize: "clamp(9px, 0.25vw + 8px, 10.5px)" }}
            >
              <div className="flex items-center gap-2">
                <span className="size-1.5 animate-blink bg-heat" />
                REC · 00:00:08
              </div>
            </div>
            <div
              className="absolute right-[clamp(0.5rem,1vw,1rem)] top-[clamp(0.5rem,1vw,1rem)] text-right font-mono tracking-[0.22em] uppercase text-foreground"
              style={{ fontSize: "clamp(9px, 0.25vw + 8px, 10.5px)" }}
            >
              <div>Spec. PP-001</div>
              <div className="text-muted-foreground">Lot A-4418</div>
            </div>

            <div
              className="absolute bottom-[clamp(0.5rem,1vw,1rem)] left-[clamp(0.5rem,1vw,1rem)] right-[clamp(0.5rem,1vw,1rem)] flex items-end justify-between gap-3 font-mono tracking-[0.22em] uppercase text-foreground"
              style={{ fontSize: "clamp(9px, 0.25vw + 8px, 10.5px)" }}
            >
              <div>
                <div className="text-muted-foreground">Subject</div>
                <div className="mt-1 text-foreground">
                  BPC-157 · 5 mg · lyophilised
                </div>
              </div>
              <div className="text-right">
                <div className="text-muted-foreground">MW</div>
                <div className="mt-1 text-brand">1419.53 g/mol</div>
              </div>
            </div>
          </div>

          <p
            className="font-mono tracking-[0.22em] uppercase text-muted-foreground"
            style={{
              marginTop: "clamp(0.65rem, 1vw, 1rem)",
              fontSize: "clamp(9px, 0.25vw + 8px, 10.5px)",
            }}
          >
            Fig. 01 — Amber borosilicate vial, argon-flushed, 5 mg fill.
          </p>
        </div>
      </div>
    </section>
  );
}

function CornerTicks() {
  const corners = [
    "top-2 left-2 border-t border-l",
    "top-2 right-2 border-t border-r",
    "bottom-2 left-2 border-b border-l",
    "bottom-2 right-2 border-b border-r",
  ];
  return (
    <>
      {corners.map((c) => (
        <div
          key={c}
          aria-hidden
          className={`pointer-events-none absolute size-[clamp(1rem,1.6vw,1.5rem)] border-foreground/40 ${c}`}
        />
      ))}
    </>
  );
}
