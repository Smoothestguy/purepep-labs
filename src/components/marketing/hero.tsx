import Link from "next/link";
import { HeroVideo } from "./hero-video";

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-background text-foreground">
      {/* Cinematic video with scroll parallax */}
      <HeroVideo />

      {/* Soft left scrim — only where the editorial copy lives. Doesn't touch the vial. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(100deg, var(--background) 0%, oklch(from var(--background) l c h / 0.6) 25%, oklch(from var(--background) l c h / 0.25) 45%, transparent 60%)",
        }}
      />

      {/* Frame ticks at the section corners — film-grade chrome */}
      <FrameTicks />

      {/* HUD strip — REC top-left, spec top-right (desktop only) */}
      <div
        className="absolute z-10 hidden items-center font-mono uppercase lg:flex"
        style={{
          top: "clamp(1rem, 2vw, 1.75rem)",
          left: "clamp(1.25rem, 3.5vw, 5rem)",
          fontSize: "clamp(9px, 0.25vw + 8px, 10.5px)",
          letterSpacing: "0.28em",
          gap: "0.6rem",
        }}
      >
        <span className="size-1.5 animate-blink bg-heat" />
        <span style={{ color: "oklch(0.97 0.005 220)" }}>REC</span>
        <span className="opacity-50">·</span>
        <span className="opacity-70">00:00:08</span>
      </div>
      <div
        className="absolute z-10 hidden text-right font-mono uppercase lg:block"
        style={{
          top: "clamp(1rem, 2vw, 1.75rem)",
          right: "clamp(1.25rem, 3.5vw, 5rem)",
          fontSize: "clamp(9px, 0.25vw + 8px, 10.5px)",
          letterSpacing: "0.28em",
        }}
      >
        <div style={{ color: "oklch(0.97 0.005 220)" }}>Spec. PP-001</div>
        <div className="opacity-60">Lot A-4418</div>
      </div>

      {/* Main content — copy stays in the left two-thirds, never crosses the vial */}
      <div
        className="relative z-10 mx-auto flex w-full max-w-[var(--content-max)] flex-col justify-center pad-x lg:min-h-[min(78vh,820px)]"
        style={{
          paddingTop: "clamp(2rem, 4vw + 1rem, 5rem)",
          paddingBottom: "clamp(2rem, 4vw + 1rem, 4rem)",
        }}
      >
        <div className="relative flex w-full flex-col lg:max-w-[min(64%,57.5rem)]">
          <div className="section-eyebrow">
            <span
              className="whitespace-nowrap"
              style={{ color: "oklch(0.82 0.15 210)" }}
            >
              § 01
            </span>
            <span
              className="h-px shrink-0"
              style={{
                width: "clamp(1.5rem, 3vw, 2.75rem)",
                background: "oklch(1 0 0 / 0.18)",
              }}
            />
            <span
              className="whitespace-nowrap"
              style={{ color: "oklch(0.7 0.01 230)" }}
            >
              Index Vol. XII · Spring ’26
            </span>
          </div>

          <h1
            className="display-hero"
            style={{
              marginTop: "clamp(1rem, 2vw, 2rem)",
              color: "oklch(0.98 0.005 220)",
              textShadow: "0 2px 24px oklch(0 0 0 / 0.55)",
              fontSize: "clamp(2.25rem, 6vw, 6.75rem)",
              lineHeight: 0.92,
            }}
          >
            <span className="block italic font-light animate-rise">
              Research-grade
            </span>
            <span
              className="block animate-rise"
              style={{ animationDelay: "120ms" }}
            >
              peptides,
            </span>
            <span
              className="block animate-rise"
              style={{ animationDelay: "240ms", color: "oklch(0.7 0.01 230)" }}
            >
              documented to
            </span>
            <span
              className="block animate-rise"
              style={{ animationDelay: "360ms" }}
            >
              the{" "}
              <span className="italic text-gradient-brand">milligram.</span>
            </span>
          </h1>

          <p
            className="body-lede animate-rise"
            style={{
              marginTop: "clamp(1.5rem, 2.5vw, 2.25rem)",
              maxWidth: "36rem",
              color: "oklch(0.78 0.01 230)",
              animationDelay: "520ms",
            }}
          >
            Every vial is HPLC-verified, lot-traceable, and shipped with a
            third-party Certificate of Analysis. No proprietary blends. No
            mystery excipients. Just the compound, documented.
          </p>

          <div
            className="flex flex-wrap items-center animate-rise"
            style={{
              marginTop: "clamp(1.5rem, 2.5vw, 2.25rem)",
              gap: "clamp(0.65rem, 1.2vw, 1rem)",
              animationDelay: "640ms",
            }}
          >
            <Link
              href="#catalog"
              className="group inline-flex items-center gap-3 whitespace-nowrap font-mono uppercase transition-all hover:shadow-[0_0_0_4px_oklch(0.82_0.15_210_/_0.22)]"
              style={{
                background: "oklch(0.82 0.15 210)",
                color: "oklch(0.14 0.01 250)",
                paddingInline: "clamp(1.1rem, 1.8vw, 1.6rem)",
                paddingBlock: "clamp(0.75rem, 1vw, 1rem)",
                fontSize: "clamp(10px, 0.3vw + 9px, 11px)",
                letterSpacing: "0.3em",
              }}
            >
              Enter catalog
              <span className="transition-transform group-hover:translate-x-1">
                →
              </span>
            </Link>
            <Link
              href="#coa"
              className="group inline-flex items-center gap-3 whitespace-nowrap font-mono uppercase transition-colors hover:border-white"
              style={{
                border: "1px solid oklch(1 0 0 / 0.22)",
                color: "oklch(0.97 0.005 220)",
                paddingInline: "clamp(1.1rem, 1.8vw, 1.6rem)",
                paddingBlock: "clamp(0.75rem, 1vw, 1rem)",
                fontSize: "clamp(10px, 0.3vw + 9px, 11px)",
                letterSpacing: "0.3em",
              }}
            >
              <span
                className="size-1.5 rounded-full"
                style={{ background: "oklch(0.82 0.15 210)" }}
              />
              View documentation
            </Link>
          </div>

        </div>
      </div>
    </section>
  );
}

function FrameTicks() {
  const corners: Array<{ pos: string; bx: string; by: string }> = [
    { pos: "top-3 left-3", bx: "border-l", by: "border-t" },
    { pos: "top-3 right-3", bx: "border-r", by: "border-t" },
    { pos: "bottom-3 left-3", bx: "border-l", by: "border-b" },
    { pos: "bottom-3 right-3", bx: "border-r", by: "border-b" },
  ];
  return (
    <>
      {corners.map((c) => (
        <div
          key={c.pos}
          aria-hidden
          className={`pointer-events-none absolute z-10 size-5 ${c.pos} ${c.bx} ${c.by}`}
          style={{ borderColor: "oklch(1 0 0 / 0.32)" }}
        />
      ))}
    </>
  );
}
