export type Accent = {
  /** Two color stops for the hex-logo gradient on the label */
  from: string;
  to: string;
};

export type Compound = {
  accession: string;
  name: string;
  codename: string;
  sequence: string;
  molecularWeight: number;
  purity: number;
  dose: string;
  price: number;
  inStock: number;
  category: "structural" | "metabolic" | "nootropic" | "senescence";
  family: string;
  blurb: string;
  lot: string;
  coaDate: string;
  /** Per-compound label accent — only the hex logo gradient changes per SKU */
  accent: Accent;
};

export const compounds: Compound[] = [
  {
    accession: "PP-001",
    name: "BPC-157",
    codename: "Body Protective Compound",
    sequence: "GEPPPGKPADDAGLV",
    molecularWeight: 1419.53,
    purity: 99.42,
    dose: "5 mg",
    price: 68,
    inStock: 214,
    category: "structural",
    family: "Pentadecapeptide",
    blurb:
      "Gastric pentadecapeptide. Synthesised and freeze-dried under inert argon.",
    lot: "A-4418",
    coaDate: "2026-03-14",
    accent: { from: "oklch(0.65 0.22 258)", to: "oklch(0.82 0.15 210)" },
  },
  {
    accession: "PP-002",
    name: "TB-500",
    codename: "Thymosin Beta-4 Fragment",
    sequence: "LKKTETQ",
    molecularWeight: 889.04,
    purity: 99.11,
    dose: "5 mg",
    price: 74,
    inStock: 138,
    category: "structural",
    family: "Thymosin fragment",
    blurb:
      "Actin-sequestering peptide fragment. Lyophilised, sealed at 18 °C.",
    lot: "A-4420",
    coaDate: "2026-03-17",
    accent: { from: "oklch(0.78 0.16 195)", to: "oklch(0.85 0.13 175)" },
  },
  {
    accession: "PP-003",
    name: "GHK-Cu",
    codename: "Copper Tripeptide",
    sequence: "GHK · Cu²⁺",
    molecularWeight: 402.92,
    purity: 99.68,
    dose: "50 mg",
    price: 52,
    inStock: 402,
    category: "senescence",
    family: "Copper tripeptide",
    blurb: "Endogenous tripeptide–copper complex. Royal blue lyophilisate.",
    lot: "B-1904",
    coaDate: "2026-03-09",
    accent: { from: "oklch(0.55 0.18 60)", to: "oklch(0.78 0.16 75)" },
  },
  {
    accession: "PP-004",
    name: "Semax",
    codename: "Heptapeptide Nootropic",
    sequence: "MEHFPGP",
    molecularWeight: 813.93,
    purity: 99.05,
    dose: "10 mg",
    price: 84,
    inStock: 96,
    category: "nootropic",
    family: "ACTH analogue",
    blurb: "Synthetic analogue of ACTH(4-10). Sequence conserved from the endogenous ACTH fragment.",
    lot: "C-0312",
    coaDate: "2026-03-22",
    accent: { from: "oklch(0.55 0.22 305)", to: "oklch(0.72 0.2 340)" },
  },
  {
    accession: "PP-005",
    name: "Selank",
    codename: "Anxiolytic Heptapeptide",
    sequence: "TKPRPGP",
    molecularWeight: 751.87,
    purity: 99.24,
    dose: "10 mg",
    price: 79,
    inStock: 64,
    category: "nootropic",
    family: "Tuftsin analogue",
    blurb: "Tuftsin analogue. Stored at −20 °C; thaw once only.",
    lot: "C-0318",
    coaDate: "2026-03-22",
    accent: { from: "oklch(0.5 0.2 275)", to: "oklch(0.78 0.14 220)" },
  },
  {
    accession: "PP-006",
    name: "Tesamorelin",
    codename: "Growth-Hormone Releasing Factor",
    sequence: "44 aa (hGRF analogue)",
    molecularWeight: 5135.85,
    purity: 99.03,
    dose: "5 mg",
    price: 148,
    inStock: 42,
    category: "metabolic",
    family: "GHRH analogue",
    blurb: "Stabilised GHRH(1-44) analogue. Amber glass, N₂ headspace.",
    lot: "D-2207",
    coaDate: "2026-03-28",
    accent: { from: "oklch(0.6 0.18 160)", to: "oklch(0.78 0.14 180)" },
  },
  {
    accession: "PP-007",
    name: "Epitalon",
    codename: "Pineal Tetrapeptide",
    sequence: "AEDG",
    molecularWeight: 390.35,
    purity: 99.74,
    dose: "10 mg",
    price: 58,
    inStock: 188,
    category: "senescence",
    family: "Tetrapeptide",
    blurb: "Telomerase-associated tetrapeptide. Isolated from bovine pineal.",
    lot: "B-1911",
    coaDate: "2026-03-11",
    accent: { from: "oklch(0.45 0.2 290)", to: "oklch(0.7 0.18 320)" },
  },
  {
    accession: "PP-008",
    name: "MOTS-c",
    codename: "Mitochondrial-Derived Peptide",
    sequence: "MRWQEMGYIFYPRKLR",
    molecularWeight: 2174.58,
    purity: 99.19,
    dose: "10 mg",
    price: 132,
    inStock: 76,
    category: "metabolic",
    family: "Mitochondrial peptide",
    blurb:
      "16-residue peptide encoded within the mitochondrial 12S rRNA region.",
    lot: "D-2215",
    coaDate: "2026-03-29",
    accent: { from: "oklch(0.55 0.22 35)", to: "oklch(0.75 0.18 55)" },
  },
];

export const categories = [
  { key: "structural", label: "Structural" },
  { key: "metabolic", label: "Metabolic" },
  { key: "nootropic", label: "Nootropic" },
  { key: "senescence", label: "Senescence" },
] as const;

export function slugify(name: string): string {
  return name.toLowerCase().replaceAll(/\s+/g, "-");
}

export function compoundBySlug(slug: string): Compound | undefined {
  return compounds.find((c) => slugify(c.name) === slug);
}

const COMPOUND_PHOTO: Record<string, string> = {
  "bpc-157": "BPC157.png",
  "tb-500": "TB500.png",
  "ghk-cu": "GHKCu.png",
  semax: "Semax-10mg.png",
  selank: "Selank-10mg.png",
  tesamorelin: "Tesamorelin-5mg.png",
  epitalon: "Epitalon-10mg.png",
  "mots-c": "MOTSc.png",
};

export function compoundHasPhoto(c: Compound): boolean {
  return slugify(c.name) in COMPOUND_PHOTO;
}

export function compoundPhotoSrc(c: Compound): string {
  const file = COMPOUND_PHOTO[slugify(c.name)];
  return file ? `/images/compounds/${file}` : "/images/vial-base.png";
}
