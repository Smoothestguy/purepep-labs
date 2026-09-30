"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  compounds,
  compoundPhotoSrc,
  compoundSlug,
  defaultVariant,
} from "@/lib/compounds";

/**
 * "Every vial passes inspection" — a horizontal rail of vials with the
 * centred one under inspection, and a spec bar reading out whatever is
 * focused.
 *
 * Built on a native scroll container with scroll-snap rather than a
 * JavaScript carousel: swipe, trackpad, keyboard and screen-reader
 * behaviour all come for free, and the rail still works if the JS that
 * tracks the focused item never runs. The arrows and the spec bar are
 * enhancements on top of something that already scrolls.
 *
 * Deliberately shows no price. Prices are gated behind sign-in, so a
 * price here would either leak them or render a row of "sign in" stubs.
 */
export function InspectionCarousel() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [active, setActive] = useState(0);

  /** Whichever item's centre is nearest the scroller's centre. */
  const syncActive = useCallback(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const mid = scroller.scrollLeft + scroller.clientWidth / 2;
    let best = 0;
    let bestDelta = Infinity;

    itemRefs.current.forEach((el, i) => {
      if (!el) return;
      const centre = el.offsetLeft + el.offsetWidth / 2;
      const delta = Math.abs(centre - mid);
      if (delta < bestDelta) {
        bestDelta = delta;
        best = i;
      }
    });

    setActive((prev) => (prev === best ? prev : best));
  }, []);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    let frame = 0;
    const onScroll = () => {
      // Coalesce to one read per frame; scroll fires far faster than the
      // highlight needs to move.
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(syncActive);
    };

    scroller.addEventListener("scroll", onScroll, { passive: true });
    syncActive();

    return () => {
      cancelAnimationFrame(frame);
      scroller.removeEventListener("scroll", onScroll);
    };
  }, [syncActive]);

  const scrollTo = useCallback((index: number) => {
    const el = itemRefs.current[index];
    if (!el) return;
    el.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
      inline: "center",
      block: "nearest",
    });
  }, []);

  const current = compounds[active] ?? compounds[0];
  const variant = defaultVariant(current);
  const slug = compoundSlug(current);

  return (
    <section
      id="inspection"
      className="relative border-b border-hairline bg-background"
      style={{
        paddingTop: "clamp(3rem, 5vw, 5rem)",
        paddingBottom: "clamp(3rem, 5vw, 5rem)",
        // Drives both the item width and the padding that lets the first
        // and last vial reach the centre.
        ["--vial-w" as string]: "clamp(6.5rem, 20vw, 10rem)",
      }}
    >
      {/* Heading */}
      <div className="mx-auto w-full max-w-[var(--content-max)] pad-x">
        <div className="section-eyebrow justify-center text-center">
          <span className="whitespace-nowrap text-brand">§ 05</span>
          <span
            className="h-px shrink-0 bg-hairline"
            style={{ width: "clamp(1.5rem, 3vw, 2.75rem)" }}
          />
          <span>The catalogue</span>
        </div>
        <h2
          className="text-center font-display leading-[0.95] tracking-[-0.02em]"
          style={{
            marginTop: "clamp(0.85rem, 1.4vw, 1.25rem)",
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

      {/* Rail */}
      <div
        className="relative"
        style={{ marginTop: "clamp(2rem, 3.5vw, 3rem)" }}
      >
        <div
          ref={scrollerRef}
          role="listbox"
          aria-label="Compound catalogue"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "ArrowRight") {
              e.preventDefault();
              scrollTo(Math.min(active + 1, compounds.length - 1));
            } else if (e.key === "ArrowLeft") {
              e.preventDefault();
              scrollTo(Math.max(active - 1, 0));
            }
          }}
          className="flex snap-x snap-mandatory items-center overflow-x-auto focus:outline-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          style={{
            gap: "clamp(0.75rem, 2vw, 1.75rem)",
            // Lets the first and last item scroll to dead centre.
            paddingInline: "calc(50% - (var(--vial-w) / 2))",
            // overflow-x: auto forces overflow-y to auto too, so the rail
            // clips anything drawn outside it — the scaled-up focused vial
            // and its corner brackets both need room to breathe.
            paddingBlock: "clamp(1.75rem, 4vw, 2.75rem)",
          }}
        >
          {compounds.map((c, i) => {
            const isActive = i === active;
            const v = defaultVariant(c);
            return (
              <div
                key={c.accession}
                ref={(el) => {
                  itemRefs.current[i] = el;
                }}
                role="option"
                aria-selected={isActive}
                className="relative shrink-0 snap-center"
                style={{ width: "var(--vial-w)" }}
              >
                <button
                  type="button"
                  onClick={() => scrollTo(i)}
                  aria-label={`${c.name}, ${v.dose}`}
                  className="block w-full cursor-pointer text-center transition-all duration-500"
                  style={{
                    transform: isActive ? "scale(1.28)" : "scale(1)",
                    opacity: isActive ? 1 : 0.45,
                    filter: isActive ? "none" : "grayscale(0.35)",
                  }}
                >
                  <img
                    src={compoundPhotoSrc(c)}
                    alt=""
                    aria-hidden
                    loading="lazy"
                    className="mx-auto block h-auto w-full object-contain"
                  />
                </button>

                {/* Inspection ticks — only around the focused vial. */}
                {isActive ? <InspectionTicks /> : null}
              </div>
            );
          })}
        </div>

        {/* Arrows. Hidden from assistive tech: the rail itself is already
            keyboard-operable and exposed as a listbox. */}
        <RailArrow
          side="left"
          disabled={active === 0}
          onClick={() => scrollTo(Math.max(active - 1, 0))}
        />
        <RailArrow
          side="right"
          disabled={active === compounds.length - 1}
          onClick={() =>
            scrollTo(Math.min(active + 1, compounds.length - 1))
          }
        />
      </div>

      {/* Spec bar */}
      <div
        className="mx-auto w-full max-w-[var(--content-max)] pad-x"
        style={{ marginTop: "clamp(2rem, 3.5vw, 3rem)" }}
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
          <SpecCell label="Testing">
            <span className="text-brand">Third-party</span>
          </SpecCell>
          <SpecCell label="Certificate">
            <Link href="/coa" className="text-brand hover:underline">
              CoA archive
            </Link>
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
    "-top-3 -left-3 border-t border-l",
    "-top-3 -right-3 border-t border-r",
    "-bottom-3 -left-3 border-b border-l",
    "-bottom-3 -right-3 border-b border-r",
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

function RailArrow({
  side,
  disabled,
  onClick,
}: {
  side: "left" | "right";
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-hidden
      tabIndex={-1}
      onClick={onClick}
      disabled={disabled}
      className={`absolute top-1/2 hidden -translate-y-1/2 items-center justify-center border border-hairline bg-background/80 text-foreground backdrop-blur transition-colors hover:border-foreground disabled:opacity-25 sm:flex ${
        side === "left" ? "left-3" : "right-3"
      }`}
      style={{ width: "2.25rem", height: "2.25rem" }}
    >
      {side === "left" ? "←" : "→"}
    </button>
  );
}
