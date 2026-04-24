import { cn } from "@/lib/utils";

type Props = {
  className?: string;
};

/**
 * PurePep hexagonal molecular mark — inspired by the logo:
 * blue→cyan gradient hexagon stroke with a molecular lattice inside,
 * one orange atom as the signature detail.
 */
export function PurepepMark({ className }: Props) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      aria-label="PurePep mark"
      className={cn("shrink-0", className)}
    >
      <defs>
        <linearGradient id="pp-hex" x1="20" y1="2" x2="20" y2="38" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="var(--brand-deep)" />
          <stop offset="1" stopColor="var(--brand)" />
        </linearGradient>
      </defs>

      {/* Hexagon outer */}
      <path
        d="M20 3 L34.32 11.25 L34.32 28.75 L20 37 L5.68 28.75 L5.68 11.25 Z"
        stroke="url(#pp-hex)"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />

      {/* Molecular lattice — 6 atoms radiating from center */}
      <g stroke="var(--brand)" strokeWidth="1.1" strokeLinecap="round">
        <line x1="20" y1="20" x2="20" y2="11" />
        <line x1="20" y1="20" x2="20" y2="29" />
        <line x1="20" y1="20" x2="27.5" y2="15.5" />
        <line x1="20" y1="20" x2="12.5" y2="24.5" />
        <line x1="20" y1="20" x2="27.5" y2="24.5" />
        <line x1="20" y1="20" x2="12.5" y2="15.5" />
      </g>

      {/* Atoms */}
      <circle cx="20" cy="20" r="1.9" fill="var(--brand-deep)" />
      <circle cx="20" cy="11" r="1.6" fill="var(--brand)" />
      <circle cx="20" cy="29" r="1.6" fill="var(--brand)" />
      <circle cx="27.5" cy="15.5" r="1.6" fill="var(--brand)" />
      <circle cx="12.5" cy="24.5" r="1.6" fill="var(--brand)" />
      <circle cx="27.5" cy="24.5" r="1.6" fill="var(--heat)" />
      <circle cx="12.5" cy="15.5" r="1.6" fill="var(--brand)" />
    </svg>
  );
}
