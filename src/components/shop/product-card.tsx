import Link from "next/link";
import type { Compound } from "@/lib/compounds";
import {
  slugify,
  compoundHasPhoto,
  compoundPhotoSrc,
} from "@/lib/compounds";
import { CompoundLabel } from "./compound-label";

type Props = {
  compound: Compound;
};

export function ProductCard({ compound: c }: Props) {
  const hasPhoto = compoundHasPhoto(c);
  return (
    <Link
      href={`/product/${slugify(c.name)}`}
      className="group relative flex flex-col border border-hairline bg-background transition-colors hover:bg-surface/60"
      style={{
        padding: "clamp(1.1rem, 1.8vw, 1.5rem)",
        gap: "clamp(0.9rem, 1.4vw, 1.25rem)",
      }}
    >
      {/* Corner ticks — appear on hover */}
      <CardCornerTicks />

      {/* Vial image — photoreal render or base + SVG label fallback */}
      <div
        className="relative -mx-[clamp(1.1rem,1.8vw,1.5rem)] -mt-[clamp(1.1rem,1.8vw,1.5rem)] aspect-square overflow-hidden border-b border-hairline bg-[oklch(0.05_0.005_250)]"
      >
        <img
          src={compoundPhotoSrc(c)}
          alt={`${c.name} vial`}
          className="absolute inset-0 h-full w-full object-contain transition-transform duration-700 group-hover:scale-[1.03]"
          loading="lazy"
        />
        {!hasPhoto && (
          <div
            className="absolute"
            style={{
              left: "36%",
              right: "33%",
              top: "47%",
              height: "29%",
            }}
          >
            <CompoundLabel compound={c} uid={`card-${c.accession}`} />
          </div>
        )}
        {/* Soft bottom fade so the image meets the typographic block cleanly */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-1/4"
          style={{
            background:
              "linear-gradient(to bottom, transparent, var(--background) 95%)",
          }}
        />
      </div>

      {/* Header row — accession + family */}
      <div
        className="flex items-baseline justify-between font-mono tracking-[0.22em] uppercase"
        style={{ fontSize: "clamp(9.5px, 0.25vw + 8.5px, 10.5px)" }}
      >
        <span className="text-foreground">{c.accession}</span>
        <span className="text-muted-foreground">{c.family}</span>
      </div>

      {/* Compound name */}
      <div>
        <h3
          className="font-display leading-none tracking-tight text-foreground transition-colors group-hover:text-brand"
          style={{ fontSize: "clamp(1.75rem, 2.6vw, 2.5rem)" }}
        >
          {c.name}
        </h3>
        <div
          className="mt-1.5 font-mono italic tracking-[0.02em] text-muted-foreground"
          style={{ fontSize: "clamp(10px, 0.25vw + 9px, 11px)" }}
        >
          {c.codename}
        </div>
      </div>

      {/* Sequence — truncated */}
      <div
        className="min-w-0 font-mono tracking-[0.08em] text-foreground/80"
        style={{ fontSize: "clamp(10px, 0.3vw + 9px, 11px)" }}
      >
        <div
          className="uppercase tracking-[0.22em] text-muted-foreground"
          style={{ fontSize: "clamp(9px, 0.25vw + 8px, 10px)" }}
        >
          Sequence
        </div>
        <div className="mt-1 truncate">{c.sequence}</div>
      </div>

      {/* MW + purity row */}
      <div
        className="grid grid-cols-2 border-t border-hairline font-mono tracking-[0.08em]"
        style={{
          paddingTop: "clamp(0.75rem, 1.2vw, 1rem)",
          fontSize: "clamp(10px, 0.3vw + 9px, 11px)",
          columnGap: "clamp(0.75rem, 1.2vw, 1rem)",
        }}
      >
        <div>
          <div
            className="uppercase tracking-[0.22em] text-muted-foreground"
            style={{ fontSize: "clamp(9px, 0.25vw + 8px, 10px)" }}
          >
            MW
          </div>
          <div className="mt-1 text-foreground">{c.molecularWeight} g/mol</div>
        </div>
        <div className="text-right">
          <div
            className="uppercase tracking-[0.22em] text-muted-foreground"
            style={{ fontSize: "clamp(9px, 0.25vw + 8px, 10px)" }}
          >
            Purity
          </div>
          <div className="mt-1 text-brand">{c.purity}%</div>
        </div>
      </div>

      {/* Stock + price row */}
      <div className="mt-auto flex items-end justify-between gap-3">
        <div
          className="flex items-center gap-2 font-mono tracking-[0.22em] uppercase"
          style={{ fontSize: "clamp(9px, 0.25vw + 8px, 10.5px)" }}
        >
          <span
            className={`size-1.5 rounded-full ${
              c.inStock > 100 ? "bg-brand" : "bg-muted-foreground"
            }`}
          />
          <span className="text-foreground">{c.inStock}</span>
          <span className="text-muted-foreground">in stock</span>
        </div>
        <div
          className="flex items-baseline gap-1 font-display leading-none tracking-tight text-foreground"
          style={{ fontSize: "clamp(1.6rem, 2.4vw, 2.1rem)" }}
        >
          <span
            className="font-mono tracking-[0.25em] uppercase text-muted-foreground"
            style={{ fontSize: "clamp(9px, 0.2vw + 8.5px, 10px)" }}
          >
            USD
          </span>
          <span>${c.price}</span>
        </div>
      </div>
    </Link>
  );
}

function CardCornerTicks() {
  const corners = [
    "top-1.5 left-1.5 border-t border-l",
    "top-1.5 right-1.5 border-t border-r",
    "bottom-1.5 left-1.5 border-b border-l",
    "bottom-1.5 right-1.5 border-b border-r",
  ];
  return (
    <>
      {corners.map((c) => (
        <div
          key={c}
          aria-hidden
          className={`pointer-events-none absolute size-3 border-foreground/40 opacity-0 transition-opacity group-hover:opacity-100 ${c}`}
        />
      ))}
    </>
  );
}
