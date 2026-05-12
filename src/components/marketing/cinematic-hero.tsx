"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { compounds, type Compound } from "@/lib/compounds";
import { useCart } from "@/lib/cart/store";

const Scene = dynamic(
  () => import("@/components/three/scene").then((m) => m.Scene),
  { ssr: false },
);

const BG_BY_CATEGORY: Record<Compound["category"], string> = {
  regenerative: "#2a0f04",
  metabolic: "#04201d",
  nootropic: "#180c2e",
  longevity: "#041d2c",
};

const CATEGORY_LABEL: Record<Compound["category"], string> = {
  regenerative: "Regenerative",
  metabolic: "Metabolic",
  nootropic: "Nootropic",
  longevity: "Longevity",
};

export function CinematicHero() {
  const [index, setIndex] = useState(0);
  const compound = compounds[index];
  const bg = BG_BY_CATEGORY[compound.category];
  const { addItem } = useCart();

  const next = () => setIndex((i) => (i + 1) % compounds.length);
  const prev = () =>
    setIndex((i) => (i - 1 + compounds.length) % compounds.length);

  return (
    <section
      className="relative w-full overflow-hidden border-b border-hairline"
      style={{
        backgroundColor: bg,
        transition:
          "background-color 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        height: "min(900px, calc(100vh - 80px))",
        minHeight: "640px",
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
      >
        <span
          className="font-display leading-none tracking-tight uppercase select-none"
          style={{
            fontSize: "clamp(8rem, 22vw, 22rem)",
            WebkitTextStroke: "1px rgba(255,255,255,0.08)",
            color: "transparent",
            whiteSpace: "nowrap",
          }}
        >
          {compound.name}
        </span>
      </div>

      <div
        className="absolute left-0 right-0 top-0 z-20 flex items-center justify-between pad-x"
        style={{ paddingTop: "clamp(1.25rem, 2vw, 2rem)" }}
      >
        <div className="section-eyebrow">
          <span className="text-brand">
            § {String(index + 1).padStart(2, "0")}
          </span>
          <span className="h-px w-8 bg-hairline" />
          <span className="hidden sm:inline">
            Index Vol. XII · Spring &rsquo;26
          </span>
        </div>
        <div
          className="font-mono tracking-[0.22em] uppercase text-foreground/70"
          style={{ fontSize: "10.5px" }}
        >
          Spec. {compound.accession} · Lot {compound.lot}
        </div>
      </div>

      <div className="absolute inset-0 z-10">
        <Scene compound={compound} />
      </div>

      <div className="pointer-events-none absolute right-0 top-1/2 z-20 flex -translate-y-1/2 flex-col gap-2 pr-6">
        {compounds.map((c, i) => (
          <button
            key={c.accession}
            onClick={() => setIndex(i)}
            aria-label={`Go to ${c.name}`}
            className={`pointer-events-auto size-2 rounded-full transition-all ${
              i === index
                ? "scale-150 bg-foreground"
                : "bg-foreground/30 hover:bg-foreground/60"
            }`}
          />
        ))}
      </div>

      <div
        className="absolute bottom-0 left-0 right-0 z-20 grid grid-cols-1 items-end gap-6 pad-x md:grid-cols-3"
        style={{ paddingBottom: "clamp(1.5rem, 3vw, 2.5rem)" }}
      >
        <div className="flex items-center gap-4">
          <button
            onClick={prev}
            aria-label="Previous compound"
            className="grid size-12 place-items-center border border-hairline text-foreground/80 transition-colors hover:border-foreground hover:text-foreground"
          >
            ←
          </button>
          <div>
            <div
              className="font-mono tracking-[0.22em] uppercase text-foreground/60"
              style={{ fontSize: "10.5px" }}
            >
              Category
            </div>
            <div
              className="mt-1 font-mono tracking-[0.18em] uppercase text-foreground"
              style={{ fontSize: "12px" }}
            >
              {CATEGORY_LABEL[compound.category]} · {compound.family}
            </div>
          </div>
        </div>

        <div className="text-center">
          <div
            className="font-display leading-none tracking-tight text-foreground"
            style={{ fontSize: "clamp(2.5rem, 5vw, 4.5rem)" }}
          >
            {compound.name}
          </div>
          <div
            className="mt-2 font-mono tracking-[0.22em] uppercase text-foreground/60"
            style={{ fontSize: "10.5px" }}
          >
            {compound.sequence} · MW {compound.molecularWeight}
          </div>
        </div>

        <div className="flex items-center justify-end gap-4">
          <div className="text-right">
            <div
              className="font-mono tracking-[0.22em] uppercase text-foreground/60"
              style={{ fontSize: "10.5px" }}
            >
              {compound.dose}
            </div>
            <div
              className="mt-1 font-display leading-none tracking-tight text-foreground"
              style={{ fontSize: "clamp(1.5rem, 2.5vw, 2.25rem)" }}
            >
              ${compound.price}
            </div>
          </div>
          <button
            onClick={() => addItem(compound)}
            className="bg-brand font-mono tracking-[0.3em] uppercase text-brand-foreground transition-all hover:shadow-[0_0_0_4px_oklch(0.82_0.15_210_/_0.18)]"
            style={{
              paddingInline: "clamp(1rem, 1.6vw, 1.4rem)",
              paddingBlock: "clamp(0.75rem, 1vw, 1rem)",
              fontSize: "11px",
            }}
          >
            Add to cart
          </button>
          <button
            onClick={next}
            aria-label="Next compound"
            className="grid size-12 place-items-center border border-hairline text-foreground/80 transition-colors hover:border-foreground hover:text-foreground"
          >
            →
          </button>
        </div>
      </div>
    </section>
  );
}
