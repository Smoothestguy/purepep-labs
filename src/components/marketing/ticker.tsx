import { compounds } from "@/lib/compounds";

const tokens = compounds.map((c) => c.name);

const seals = [
  "ISO 17025 methodology",
  "HPLC-MS verified",
  "Endotoxin <0.1 EU/mg",
  "Argon-sealed",
  "Third-party assayed",
  "Cold-chain shipping",
];

export function Ticker() {
  const row = [...tokens, ...seals, ...tokens, ...seals];
  return (
    <div className="relative overflow-hidden border-y border-hairline bg-surface">
      <div
        className="flex min-w-max animate-marquee items-center"
        style={{ paddingBlock: "clamp(0.875rem, 1.6vw, 1.4rem)" }}
      >
        {row.map((t, i) => (
          <div
            key={`${t}-${i}`}
            className="flex items-center font-display italic tracking-tight text-foreground/80"
            style={{
              gap: "clamp(1rem, 2vw, 2rem)",
              paddingInline: "clamp(1rem, 2vw, 2rem)",
              fontSize: "clamp(1.15rem, 2.2vw, 2rem)",
            }}
          >
            <span className="whitespace-nowrap">{t}</span>
            <span aria-hidden className="size-1.5 rounded-full bg-brand" />
          </div>
        ))}
      </div>
      <div
        className="pointer-events-none absolute inset-y-0 left-0 bg-gradient-to-r from-surface to-transparent"
        style={{ width: "clamp(3rem, 6vw, 6rem)" }}
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 bg-gradient-to-l from-surface to-transparent"
        style={{ width: "clamp(3rem, 6vw, 6rem)" }}
      />
    </div>
  );
}
