"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  compounds,
  compoundPhotoSrc,
  compoundSlug,
  defaultVariant,
} from "@/lib/compounds";

/**
 * "Every vial passes inspection" — a slow, continuous marquee of vials.
 * Whichever vial is crossing the centre is under inspection: it scales
 * up, gets the corner brackets, and the spec bar below reads it out.
 *
 * The track holds the catalogue twice and slides left by exactly half
 * its width, so the loop is seamless. Each item carries its own trailing
 * spacing rather than using `gap`, which keeps the two halves exactly
 * equal — with gap, the seam would jump by one gap width per cycle.
 *
 * Motion is CSS, not JS: the animation keeps running smoothly even while
 * React is busy. JS only reads which vial is nearest the centre, a few
 * times a second. Hover or keyboard focus pauses it so a vial can be
 * clicked; reduced-motion users get a static, scrollable rail instead.
 */

const n = compounds.length;
const LOOP = [...compounds, ...compounds];
/** Seconds per vial — slow enough to read, fast enough to feel alive. */
const SECONDS_PER_VIAL = 3.2;

export function InspectionCarousel() {
  const viewportRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [activeSlot, setActiveSlot] = useState(0);

  useEffect(() => {
    let frame = 0;
    let last = 0;

    const tick = (t: number) => {
      // Measuring every frame is wasted work; ~8 reads a second is plenty
      // for a highlight that moves this slowly.
      if (t - last > 120) {
        last = t;
        const vp = viewportRef.current;
        if (vp) {
          const r = vp.getBoundingClientRect();
          const mid = r.left + r.width / 2;
          let best = 0;
          let bestDelta = Infinity;
          itemRefs.current.forEach((el, i) => {
            if (!el) return;
            const b = el.getBoundingClientRect();
            const d = Math.abs(b.left + b.width / 2 - mid);
            if (d < bestDelta) {
              bestDelta = d;
              best = i;
            }
          });
          setActiveSlot((prev) => (prev === best ? prev : best));
        }
      }
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  const current = LOOP[activeSlot] ?? compounds[0];
  const variant = defaultVariant(current);
  const slug = compoundSlug(current);

  return (
    <section
      id="inspection"
      className="relative border-b border-hairline bg-background"
      style={{
        paddingTop: "clamp(2.5rem, 4vw, 4rem)",
        paddingBottom: "clamp(2.5rem, 4vw, 4rem)",
        ["--vial-w" as string]: "clamp(6.5rem, 14vw, 10rem)",
        ["--vial-gap" as string]: "clamp(1.25rem, 3vw, 2.5rem)",
      }}
    >
      <div className="mx-auto w-full max-w-[var(--content-max)] pad-x">
        <div className="section-eyebrow justify-center text-center">
          <span className="whitespace-nowrap text-brand">§ 01</span>
          <span
            className="h-px shrink-0 bg-hairline"
            style={{ width: "clamp(1.5rem, 3vw, 2.75rem)" }}
          />
          <span>The catalogue</span>
        </div>
        <h2
          className="text-center font-display leading-[0.95] tracking-[-0.02em]"
          style={{
            marginTop: "clamp(0.75rem, 1.2vw, 1.1rem)",
            fontSize: "clamp(1.9rem, 5vw, 3.75rem)",
          }}
        >
          Every vial{" "}
          <span className="italic font-light text-muted-foreground">
            passes
          </span>{" "}
          <span className="italic text-gradient-brand">inspection.</span>
        </h2>
      </div>

      {/* Marquee */}
      <div
        ref={viewportRef}
        className="pp-marquee relative"
        style={{
          marginTop: "clamp(1.5rem, 3vw, 2.5rem)",
          // Vertical room for the scaled-up vial and its brackets.
          paddingBlock: "clamp(1.75rem, 3.5vw, 2.75rem)",
          // Soft fade at both edges so vials drift in and out rather
          // than being cut off by the viewport.
          maskImage:
            "linear-gradient(to right, transparent, black 7%, black 93%, transparent)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent, black 7%, black 93%, transparent)",
        }}
      >
        <div
          className="pp-marquee-track flex w-max items-center"
          style={{
            ["--marquee-duration" as string]: `${n * SECONDS_PER_VIAL}s`,
          }}
        >
          {LOOP.map((c, i) => {
            const isActive = i === activeSlot;
            const v = defaultVariant(c);
            return (
              <div
                key={`${c.accession}-${i}`}
                ref={(el) => {
                  itemRefs.current[i] = el;
                }}
                className="relative shrink-0"
                style={{
                  width: "var(--vial-w)",
                  marginRight: "var(--vial-gap)",
                }}
                // The second copy exists only to make the loop seamless.
                aria-hidden={i >= n}
              >
                <Link
                  href={`/product/${compoundSlug(c)}`}
                  tabIndex={i >= n ? -1 : 0}
                  aria-label={`${c.name}, ${v.dose}, $${v.price}`}
                  className="block transition-all duration-500 ease-out"
                  style={{
                    transform: isActive ? "scale(1.3)" : "scale(0.92)",
                    opacity: isActive ? 1 : 0.5,
                    filter: isActive ? "none" : "grayscale(0.4)",
                  }}
                >
                  <img
                    src={compoundPhotoSrc(c)}
                    alt=""
                    loading="lazy"
                    className="mx-auto block h-auto w-full object-contain"
                  />
                </Link>
                {isActive ? <InspectionTicks /> : null}
              </div>
            );
          })}
        </div>
      </div>

      {/* Spec bar */}
      <div
        className="mx-auto w-full max-w-[var(--content-max)] pad-x"
        style={{ marginTop: "clamp(1.25rem, 2.5vw, 2rem)" }}
      >
        <div
          className="grid grid-cols-2 gap-px border border-hairline bg-hairline md:grid-cols-[1.4fr_1fr_1fr_1.2fr_auto]"
          aria-live="polite"
        >
          <SpecCell label="Under inspection">
            <span
              className="font-display tracking-tight text-foreground"
              style={{ fontSize: "clamp(1.1rem, 2vw, 1.5rem)" }}
            >
              {current.name}
            </span>
          </SpecCell>
          <SpecCell label="Format">{variant.dose} vial</SpecCell>
          <SpecCell label="Price">
            <span
              className="font-display tracking-tight text-foreground"
              style={{ fontSize: "clamp(1.1rem, 2vw, 1.5rem)" }}
            >
              ${variant.price}
            </span>
          </SpecCell>
          <SpecCell label="Certificate">
            {variant.coaPdf ? (
              <a
                href={`/coa/${variant.coaPdf}`}
                target="_blank"
                rel="noopener"
                className="text-brand hover:underline"
              >
                View CoA
              </a>
            ) : (
              <span className="text-muted-foreground">In assay</span>
            )}
          </SpecCell>

          <div
            className="col-span-2 flex items-center bg-background md:col-span-1"
            style={{ padding: "clamp(0.9rem, 1.4vw, 1.25rem)" }}
          >
            <Link
              href={`/product/${slug}`}
              className="group inline-flex w-full items-center justify-between gap-3 whitespace-nowrap bg-brand font-mono tracking-[0.3em] uppercase text-brand-foreground transition-all hover:shadow-[0_0_0_4px_oklch(0.82_0.15_210_/_0.18)] md:w-auto"
              style={{
                paddingInline: "clamp(1rem, 1.6vw, 1.4rem)",
                paddingBlock: "clamp(0.7rem, 1vw, 0.9rem)",
                fontSize: "clamp(9.5px, 0.3vw + 8.5px, 11px)",
              }}
            >
              View compound
              <span
                aria-hidden
                className="transition-transform group-hover:translate-x-1"
              >
                →
              </span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function SpecCell({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="flex flex-col gap-1.5 bg-background"
      style={{ padding: "clamp(0.9rem, 1.4vw, 1.25rem)" }}
    >
      <span
        className="font-mono tracking-[0.25em] uppercase text-muted-foreground"
        style={{ fontSize: "clamp(9px, 0.25vw + 8px, 10px)" }}
      >
        {label}
      </span>
      <span
        className="font-mono tracking-[0.05em] text-foreground"
        style={{ fontSize: "clamp(11px, 0.3vw + 10px, 12.5px)" }}
      >
        {children}
      </span>
    </div>
  );
}

/** Corner brackets, echoing the vial figure on the product page. */
function InspectionTicks() {
  const corners = [
    "-top-4 -left-3 border-t border-l",
    "-top-4 -right-3 border-t border-r",
    "-bottom-4 -left-3 border-b border-l",
    "-bottom-4 -right-3 border-b border-r",
  ];
  return (
    <>
      {corners.map((c) => (
        <span
          key={c}
          aria-hidden
          className={`pointer-events-none absolute size-4 border-brand ${c}`}
        />
      ))}
    </>
  );
}
