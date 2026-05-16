import type { Compound } from "@/lib/compounds";
import { compoundHasPhoto, compoundPhotoSrc } from "@/lib/compounds";
import { CompoundLabel } from "./compound-label";

type Props = {
  compound: Compound;
};

export function CompoundVial({ compound: c }: Props) {
  const hasPhoto = compoundHasPhoto(c);

  return (
    <div className="relative">
      <div className="relative aspect-square w-full overflow-hidden border border-hairline bg-[oklch(0.05_0.005_250)]">
        <VialCornerTicks />

        <img
          src={compoundPhotoSrc(c)}
          alt={`${c.name} vial`}
          className="absolute inset-0 h-full w-full object-contain"
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
            <CompoundLabel compound={c} uid={c.accession} />
          </div>
        )}

        {/* HUD chrome */}
        <div
          className="absolute left-[clamp(0.5rem,1vw,1rem)] top-[clamp(0.5rem,1vw,1rem)] font-mono tracking-[0.22em] uppercase text-[oklch(0.97_0.005_220)]"
          style={{ fontSize: "clamp(9px, 0.25vw + 8px, 10.5px)" }}
        >
          <div className="flex items-center gap-2">
            <span className="size-1.5 animate-blink bg-heat" />
            REC · 00:00:08
          </div>
        </div>

        <div
          className="absolute right-[clamp(0.5rem,1vw,1rem)] top-[clamp(0.5rem,1vw,1rem)] text-right font-mono tracking-[0.22em] uppercase text-[oklch(0.97_0.005_220)]"
          style={{ fontSize: "clamp(9px, 0.25vw + 8px, 10.5px)" }}
        >
          <div>Spec. {c.accession}</div>
          <div className="opacity-60">Lot {c.lot}</div>
        </div>

        <div
          className="absolute bottom-[clamp(0.5rem,1vw,1rem)] left-[clamp(0.5rem,1vw,1rem)] right-[clamp(0.5rem,1vw,1rem)] flex items-end justify-between gap-3 font-mono tracking-[0.22em] uppercase text-[oklch(0.97_0.005_220)]"
          style={{ fontSize: "clamp(9px, 0.25vw + 8px, 10.5px)" }}
        >
          <div>
            <div className="opacity-60">Subject</div>
            <div className="mt-1">
              {c.name} · {c.dose} · lyophilised
            </div>
          </div>
          <div className="text-right">
            <div className="opacity-60">MW</div>
            <div className="mt-1 text-brand">{c.molecularWeight} g/mol</div>
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
        Fig. — Amber borosilicate vial, argon-flushed, {c.dose} fill.
      </p>
    </div>
  );
}

function VialCornerTicks() {
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
          className={`pointer-events-none absolute z-10 size-[clamp(1rem,1.6vw,1.5rem)] border-foreground/40 ${c}`}
        />
      ))}
    </>
  );
}
