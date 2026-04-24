import type { Compound } from "@/lib/compounds";

type Props = {
  compound: Compound;
};

export function CompoundVial({ compound: c }: Props) {
  return (
    <div className="relative">
      <div className="relative aspect-[4/5] w-full overflow-hidden border border-hairline bg-surface">
        <VialCornerTicks />

        <video
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
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

        {/* Top-left — REC blink */}
        <div
          className="absolute left-[clamp(0.5rem,1vw,1rem)] top-[clamp(0.5rem,1vw,1rem)] font-mono tracking-[0.22em] uppercase text-foreground"
          style={{ fontSize: "clamp(9px, 0.25vw + 8px, 10.5px)" }}
        >
          <div className="flex items-center gap-2">
            <span className="size-1.5 animate-blink bg-heat" />
            REC · 00:00:08
          </div>
        </div>

        {/* Top-right — spec + lot */}
        <div
          className="absolute right-[clamp(0.5rem,1vw,1rem)] top-[clamp(0.5rem,1vw,1rem)] text-right font-mono tracking-[0.22em] uppercase text-foreground"
          style={{ fontSize: "clamp(9px, 0.25vw + 8px, 10.5px)" }}
        >
          <div>Spec. {c.accession}</div>
          <div className="text-muted-foreground">Lot {c.lot}</div>
        </div>

        {/* Bottom — subject + MW */}
        <div
          className="absolute bottom-[clamp(0.5rem,1vw,1rem)] left-[clamp(0.5rem,1vw,1rem)] right-[clamp(0.5rem,1vw,1rem)] flex items-end justify-between gap-3 font-mono tracking-[0.22em] uppercase text-foreground"
          style={{ fontSize: "clamp(9px, 0.25vw + 8px, 10.5px)" }}
        >
          <div>
            <div className="text-muted-foreground">Subject</div>
            <div className="mt-1 text-foreground">
              {c.name} · {c.dose} · lyophilised
            </div>
          </div>
          <div className="text-right">
            <div className="text-muted-foreground">MW</div>
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
          className={`pointer-events-none absolute size-[clamp(1rem,1.6vw,1.5rem)] border-foreground/40 ${c}`}
        />
      ))}
    </>
  );
}
