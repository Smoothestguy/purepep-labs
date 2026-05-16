import type { Compound } from "@/lib/compounds";

type Props = {
  compound: Compound;
  /** Unique id is required because multiple labels coexist on a page (gradient defs collide otherwise) */
  uid: string;
};

/**
 * Renders the per-compound label as a self-contained SVG. Designed to be
 * absolutely positioned over the vial-base photograph at the on-vial label
 * coordinates — the SVG fills its container so the parent controls scale.
 *
 * The white rectangle in the SVG covers the existing PUREPEP label baked
 * into the base photo, so this works whether or not you regenerate the
 * base image with a blank label.
 */
export function CompoundLabel({ compound: c, uid }: Props) {
  const gradId = `vial-grad-${uid}`;
  const paperId = `vial-paper-${uid}`;
  const shineId = `vial-shine-${uid}`;

  // Font size derived from name length so long names like "Tesamorelin"
  // don't overflow but short names like "MOTS-c" don't look puny.
  const nameFontSize =
    c.name.length <= 6 ? 13 : c.name.length <= 10 ? 11 : 9.5;

  return (
    <svg
      viewBox="0 0 100 92"
      preserveAspectRatio="none"
      className="h-full w-full"
      aria-hidden
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={c.accent.from} />
          <stop offset="100%" stopColor={c.accent.to} />
        </linearGradient>
        {/* Subtle paper texture — slightly off-white with a vertical highlight */}
        <linearGradient id={paperId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fafafa" />
          <stop offset="50%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#f0f0f0" />
        </linearGradient>
        <linearGradient id={shineId} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="50%" stopColor="#ffffff" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Paper background — covers the existing PUREPEP brand label */}
      <rect x="0" y="0" width="100" height="92" fill={`url(#${paperId})`} />
      {/* Curvature shine to mimic light hitting the cylindrical paper */}
      <rect x="0" y="0" width="100" height="92" fill={`url(#${shineId})`} />

      {/* Hex molecule logo */}
      <g transform="translate(50 27)">
        <polygon
          points="0,-15 13,-7.5 13,7.5 0,15 -13,7.5 -13,-7.5"
          fill="none"
          stroke={`url(#${gradId})`}
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
        {/* Inner molecular dots */}
        <circle cx="0" cy="0" r="2.6" fill={`url(#${gradId})`} />
        <circle cx="-7" cy="-3.5" r="1.6" fill={`url(#${gradId})`} opacity="0.7" />
        <circle cx="7" cy="-3.5" r="1.6" fill={`url(#${gradId})`} opacity="0.7" />
        <circle cx="-7" cy="3.5" r="1.6" fill={`url(#${gradId})`} opacity="0.7" />
        <circle cx="7" cy="3.5" r="1.6" fill={`url(#${gradId})`} opacity="0.7" />
        <circle cx="0" cy="-9" r="1.4" fill={`url(#${gradId})`} opacity="0.55" />
        <circle cx="0" cy="9" r="1.4" fill={`url(#${gradId})`} opacity="0.55" />
        {/* Bonds */}
        <g stroke={`url(#${gradId})`} strokeWidth="0.6" opacity="0.6">
          <line x1="0" y1="0" x2="-7" y2="-3.5" />
          <line x1="0" y1="0" x2="7" y2="-3.5" />
          <line x1="0" y1="0" x2="-7" y2="3.5" />
          <line x1="0" y1="0" x2="7" y2="3.5" />
          <line x1="0" y1="0" x2="0" y2="-9" />
          <line x1="0" y1="0" x2="0" y2="9" />
        </g>
      </g>

      {/* Compound name */}
      <text
        x="50"
        y="62"
        textAnchor="middle"
        fontFamily="var(--font-sans, system-ui)"
        fontWeight="700"
        fontSize={nameFontSize}
        fill="#1a1f2c"
        letterSpacing="0.5"
      >
        {c.name.toUpperCase()}
      </text>

      {/* Descriptor — spaced caps in accent color */}
      <text
        x="50"
        y="76"
        textAnchor="middle"
        fontFamily="var(--font-mono, monospace)"
        fontSize="3.6"
        fill={`url(#${gradId})`}
        letterSpacing="1.2"
        fontWeight="500"
      >
        {c.codename.toUpperCase()}
      </text>

      {/* Accession code in tiny mono at the bottom */}
      <text
        x="50"
        y="86"
        textAnchor="middle"
        fontFamily="var(--font-mono, monospace)"
        fontSize="2.6"
        fill="#6b7280"
        letterSpacing="1.6"
      >
        {c.accession} · {c.dose.toUpperCase().replace(" ", "")}
      </text>
    </svg>
  );
}
