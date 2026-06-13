export type Accent = {
  /** Two color stops for the hex-logo gradient on the label */
  from: string;
  to: string;
};

export type Variant = {
  /** Display label for the dose, e.g. "10 mg", "5 mg + 5 mg", "10 mL". */
  dose: string;
  price: number;
  inStock: number;
  lot: string;
  coaDate: string;
};

export type Compound = {
  accession: string;
  name: string;
  codename: string;
  sequence: string;
  molecularWeight: number;
  purity: number;
  category: "structural" | "metabolic" | "nootropic" | "senescence";
  family: string;
  blurb: string;
  /** At least one variant; first entry is the default the card surfaces. */
  variants: Variant[];
  /** Per-compound label accent — only the hex logo gradient changes per SKU */
  accent: Accent;
};

// PLACEHOLDER_REVIEW: entries marked with this comment have placeholder values
// (sequence "TBD", molecularWeight 0, purity 99, lot "TBD", coaDate "TBD")
// inherited from the pricing-list import. Replace before going live.

export const compounds: Compound[] = [
  {
    accession: "PP-001",
    name: "BPC-157",
    codename: "Body Protective Compound",
    sequence: "GEPPPGKPADDAGLV",
    molecularWeight: 1419.53,
    purity: 99.42,
    category: "structural",
    family: "Pentadecapeptide",
    blurb:
      "Gastric pentadecapeptide. Synthesised and freeze-dried under inert argon.",
    variants: [
      { dose: "10 mg", price: 39.99, inStock: 214, lot: "A-4418", coaDate: "2026-03-14" },
    ],
    accent: { from: "oklch(0.65 0.22 258)", to: "oklch(0.82 0.15 210)" },
  },
  {
    accession: "PP-002",
    name: "TB-500",
    codename: "Thymosin Beta-4 Fragment",
    sequence: "LKKTETQ",
    molecularWeight: 889.04,
    purity: 99.11,
    category: "structural",
    family: "Thymosin fragment",
    blurb:
      "Actin-sequestering peptide fragment. Lyophilised, sealed at 18 °C.",
    variants: [
      { dose: "10 mg", price: 44.99, inStock: 138, lot: "A-4420", coaDate: "2026-03-17" },
    ],
    accent: { from: "oklch(0.78 0.16 195)", to: "oklch(0.85 0.13 175)" },
  },
  {
    accession: "PP-003",
    name: "GHK-Cu",
    codename: "Copper Tripeptide",
    sequence: "GHK · Cu²⁺",
    molecularWeight: 402.92,
    purity: 99.68,
    category: "senescence",
    family: "Copper tripeptide",
    blurb: "Endogenous tripeptide–copper complex. Royal blue lyophilisate.",
    variants: [
      { dose: "50 mg", price: 34.99, inStock: 402, lot: "B-1904", coaDate: "2026-03-09" },
      { dose: "100 mg", price: 44.99, inStock: 220, lot: "B-1904", coaDate: "2026-03-09" },
    ],
    accent: { from: "oklch(0.55 0.18 60)", to: "oklch(0.78 0.16 75)" },
  },
  {
    accession: "PP-004",
    name: "Semax",
    codename: "Heptapeptide Nootropic",
    sequence: "MEHFPGP",
    molecularWeight: 813.93,
    purity: 99.05,
    category: "nootropic",
    family: "ACTH analogue",
    blurb:
      "Synthetic analogue of ACTH(4-10). Sequence conserved from the endogenous ACTH fragment.",
    variants: [
      { dose: "10 mg", price: 49.99, inStock: 96, lot: "C-0312", coaDate: "2026-03-22" },
    ],
    accent: { from: "oklch(0.55 0.22 305)", to: "oklch(0.72 0.2 340)" },
  },
  {
    accession: "PP-005",
    name: "Selank",
    codename: "Anxiolytic Heptapeptide",
    sequence: "TKPRPGP",
    molecularWeight: 751.87,
    purity: 99.24,
    category: "nootropic",
    family: "Tuftsin analogue",
    blurb: "Tuftsin analogue. Stored at −20 °C; thaw once only.",
    variants: [
      { dose: "10 mg", price: 44.99, inStock: 64, lot: "C-0318", coaDate: "2026-03-22" },
    ],
    accent: { from: "oklch(0.5 0.2 275)", to: "oklch(0.78 0.14 220)" },
  },
  {
    accession: "PP-006",
    name: "Tesamorelin",
    codename: "Growth-Hormone Releasing Factor",
    sequence: "44 aa (hGRF analogue)",
    molecularWeight: 5135.85,
    purity: 99.03,
    category: "metabolic",
    family: "GHRH analogue",
    blurb: "Stabilised GHRH(1-44) analogue. Amber glass, N₂ headspace.",
    variants: [
      { dose: "10 mg", price: 49.99, inStock: 42, lot: "D-2207", coaDate: "2026-03-28" },
      { dose: "20 mg", price: 84.99, inStock: 36, lot: "D-2207", coaDate: "2026-03-28" },
    ],
    accent: { from: "oklch(0.6 0.18 160)", to: "oklch(0.78 0.14 180)" },
  },
  {
    accession: "PP-007",
    name: "Epitalon",
    codename: "Pineal Tetrapeptide",
    sequence: "AEDG",
    molecularWeight: 390.35,
    purity: 99.74,
    category: "senescence",
    family: "Tetrapeptide",
    blurb: "Telomerase-associated tetrapeptide. Isolated from bovine pineal.",
    variants: [
      { dose: "10 mg", price: 58, inStock: 188, lot: "B-1911", coaDate: "2026-03-11" },
    ],
    accent: { from: "oklch(0.45 0.2 290)", to: "oklch(0.7 0.18 320)" },
  },
  {
    accession: "PP-008",
    name: "MOTS-c",
    codename: "Mitochondrial-Derived Peptide",
    sequence: "MRWQEMGYIFYPRKLR",
    molecularWeight: 2174.58,
    purity: 99.19,
    category: "metabolic",
    family: "Mitochondrial peptide",
    blurb:
      "16-residue peptide encoded within the mitochondrial 12S rRNA region.",
    variants: [
      { dose: "10 mg", price: 34.99, inStock: 76, lot: "D-2215", coaDate: "2026-03-29" },
      { dose: "40 mg", price: 59.99, inStock: 48, lot: "D-2215", coaDate: "2026-03-29" },
    ],
    accent: { from: "oklch(0.55 0.22 35)", to: "oklch(0.75 0.18 55)" },
  },
  // PLACEHOLDER_REVIEW
  {
    accession: "PP-009",
    name: "BAC Water",
    codename: "Bacteriostatic Water",
    sequence: "TBD",
    molecularWeight: 0,
    purity: 99,
    category: "structural",
    family: "Diluent",
    blurb:
      "Sterile bacteriostatic water for reconstitution. 0.9% benzyl alcohol.",
    variants: [
      { dose: "10 mL", price: 5.99, inStock: 500, lot: "TBD", coaDate: "TBD" },
    ],
    accent: { from: "oklch(0.85 0.04 220)", to: "oklch(0.92 0.03 200)" },
  },
  // PLACEHOLDER_REVIEW
  {
    accession: "PP-010",
    name: "Wolverine",
    codename: "BPC-157 / TB-500 Blend",
    sequence: "TBD",
    molecularWeight: 0,
    purity: 99,
    category: "structural",
    family: "Recovery blend",
    blurb:
      "Co-lyophilised blend of BPC-157 and TB-500 in a single vial.",
    variants: [
      { dose: "5 mg + 5 mg", price: 39.99, inStock: 120, lot: "TBD", coaDate: "TBD" },
    ],
    accent: { from: "oklch(0.62 0.2 30)", to: "oklch(0.8 0.16 50)" },
  },
  // PLACEHOLDER_REVIEW
  {
    accession: "PP-011",
    name: "CJC-1295 Ipamorelin",
    codename: "GHRH / GHRP Blend",
    sequence: "TBD",
    molecularWeight: 0,
    purity: 99,
    category: "metabolic",
    family: "GHRH/GHRP blend",
    blurb: "CJC-1295 (no-DAC) paired with Ipamorelin. Co-lyophilised.",
    variants: [
      { dose: "5 mg + 5 mg", price: 49.99, inStock: 140, lot: "TBD", coaDate: "TBD" },
    ],
    accent: { from: "oklch(0.6 0.18 145)", to: "oklch(0.8 0.14 170)" },
  },
  // PLACEHOLDER_REVIEW
  {
    accession: "PP-012",
    name: "Retatrutide",
    codename: "Triple-Agonist GLP-1/GIP/Glucagon",
    sequence: "TBD",
    molecularWeight: 0,
    purity: 99,
    category: "metabolic",
    family: "Tri-agonist",
    blurb: "GLP-1 / GIP / glucagon triple receptor agonist. Lyophilised.",
    variants: [
      { dose: "10 mg", price: 64.99, inStock: 80, lot: "TBD", coaDate: "TBD" },
      { dose: "20 mg", price: 79.99, inStock: 70, lot: "TBD", coaDate: "TBD" },
      { dose: "30 mg", price: 94.99, inStock: 60, lot: "TBD", coaDate: "TBD" },
      { dose: "60 mg", price: 134.99, inStock: 40, lot: "TBD", coaDate: "TBD" },
    ],
    accent: { from: "oklch(0.58 0.2 245)", to: "oklch(0.78 0.15 220)" },
  },
  // PLACEHOLDER_REVIEW
  {
    accession: "PP-013",
    name: "Tirzepatide",
    codename: "GLP-1 / GIP Dual Agonist",
    sequence: "TBD",
    molecularWeight: 0,
    purity: 99,
    category: "metabolic",
    family: "Dual agonist",
    blurb: "GLP-1 / GIP dual receptor agonist. Lyophilised.",
    variants: [
      { dose: "20 mg", price: 69.99, inStock: 90, lot: "TBD", coaDate: "TBD" },
    ],
    accent: { from: "oklch(0.62 0.18 200)", to: "oklch(0.8 0.14 230)" },
  },
  // PLACEHOLDER_REVIEW
  {
    accession: "PP-014",
    name: "GLOW 70",
    codename: "Aesthetic Blend",
    sequence: "TBD",
    molecularWeight: 0,
    purity: 99,
    category: "senescence",
    family: "Aesthetic blend",
    blurb: "Multi-peptide aesthetic / skin blend. 70 mg total.",
    variants: [
      { dose: "70 mg", price: 69.99, inStock: 60, lot: "TBD", coaDate: "TBD" },
    ],
    accent: { from: "oklch(0.7 0.18 340)", to: "oklch(0.85 0.12 20)" },
  },
  // PLACEHOLDER_REVIEW
  {
    accession: "PP-015",
    name: "Ipamorelin",
    codename: "Selective GHRP",
    sequence: "TBD",
    molecularWeight: 0,
    purity: 99,
    category: "metabolic",
    family: "GHRP",
    blurb: "Selective growth-hormone releasing peptide. Pentapeptide.",
    variants: [
      { dose: "10 mg", price: 39.99, inStock: 150, lot: "TBD", coaDate: "TBD" },
    ],
    accent: { from: "oklch(0.65 0.18 130)", to: "oklch(0.82 0.14 155)" },
  },
  // PLACEHOLDER_REVIEW
  {
    accession: "PP-016",
    name: "KPV",
    codename: "Anti-Inflammatory Tripeptide",
    sequence: "KPV",
    molecularWeight: 0,
    purity: 99,
    category: "structural",
    family: "α-MSH fragment",
    blurb: "C-terminal tripeptide of α-MSH. Anti-inflammatory.",
    variants: [
      { dose: "10 mg", price: 24.99, inStock: 200, lot: "TBD", coaDate: "TBD" },
    ],
    accent: { from: "oklch(0.68 0.16 90)", to: "oklch(0.85 0.12 110)" },
  },
  // PLACEHOLDER_REVIEW
  {
    accession: "PP-017",
    name: "Mazdutide",
    codename: "GLP-1 / Glucagon Dual Agonist",
    sequence: "TBD",
    molecularWeight: 0,
    purity: 99,
    category: "metabolic",
    family: "Dual agonist",
    blurb: "GLP-1 / glucagon dual receptor agonist. Lyophilised.",
    variants: [
      { dose: "10 mg", price: 54.99, inStock: 75, lot: "TBD", coaDate: "TBD" },
    ],
    accent: { from: "oklch(0.6 0.2 175)", to: "oklch(0.8 0.14 195)" },
  },
  // PLACEHOLDER_REVIEW
  {
    accession: "PP-018",
    name: "5-Amino-1MQ",
    codename: "NNMT Inhibitor",
    sequence: "Small molecule",
    molecularWeight: 0,
    purity: 99,
    category: "metabolic",
    family: "Small molecule",
    blurb: "5-amino-1-methylquinolinium iodide. NNMT inhibitor.",
    variants: [
      { dose: "10 mg", price: 29.99, inStock: 110, lot: "TBD", coaDate: "TBD" },
    ],
    accent: { from: "oklch(0.6 0.2 50)", to: "oklch(0.8 0.16 75)" },
  },
  // PLACEHOLDER_REVIEW
  {
    accession: "PP-019",
    name: "Glutathione",
    codename: "Reduced Glutathione",
    sequence: "γ-ECG",
    molecularWeight: 0,
    purity: 99,
    category: "senescence",
    family: "Tripeptide antioxidant",
    blurb: "Reduced glutathione (GSH). 1.5 g per vial.",
    variants: [
      { dose: "1500 mg", price: 39.99, inStock: 100, lot: "TBD", coaDate: "TBD" },
    ],
    accent: { from: "oklch(0.7 0.14 145)", to: "oklch(0.86 0.1 165)" },
  },
  // PLACEHOLDER_REVIEW
  {
    accession: "PP-020",
    name: "PT-141",
    codename: "Bremelanotide",
    sequence: "TBD",
    molecularWeight: 0,
    purity: 99,
    category: "nootropic",
    family: "Melanocortin agonist",
    blurb: "Melanocortin receptor agonist. Cyclic heptapeptide.",
    variants: [
      { dose: "10 mg", price: 34.99, inStock: 130, lot: "TBD", coaDate: "TBD" },
    ],
    accent: { from: "oklch(0.55 0.22 15)", to: "oklch(0.75 0.18 350)" },
  },
  // PLACEHOLDER_REVIEW
  {
    accession: "PP-021",
    name: "IGF-1 LR3",
    codename: "Long-Arg3 IGF-1",
    sequence: "TBD",
    molecularWeight: 0,
    purity: 99,
    category: "structural",
    family: "IGF analogue",
    blurb: "Long Arg3 insulin-like growth factor 1 analogue.",
    variants: [
      { dose: "1 mg", price: 49.99, inStock: 80, lot: "TBD", coaDate: "TBD" },
    ],
    accent: { from: "oklch(0.6 0.18 280)", to: "oklch(0.78 0.14 250)" },
  },
  // PLACEHOLDER_REVIEW
  {
    accession: "PP-022",
    name: "Melanotan 2",
    codename: "α-MSH Analogue",
    sequence: "TBD",
    molecularWeight: 0,
    purity: 99,
    category: "senescence",
    family: "Melanocortin agonist",
    blurb: "Cyclic α-MSH analogue. Pigmentation peptide.",
    variants: [
      { dose: "10 mg", price: 39.99, inStock: 140, lot: "TBD", coaDate: "TBD" },
    ],
    accent: { from: "oklch(0.5 0.2 50)", to: "oklch(0.7 0.18 30)" },
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

/** First variant — used as the default surfaced on the catalog card. */
export function defaultVariant(c: Compound): Variant {
  return c.variants[0];
}

export function variantByDose(c: Compound, dose: string): Variant | undefined {
  return c.variants.find((v) => v.dose === dose);
}

export function hasMultipleVariants(c: Compound): boolean {
  return c.variants.length > 1;
}

export function priceRange(c: Compound): { min: number; max: number } {
  const prices = c.variants.map((v) => v.price);
  return { min: Math.min(...prices), max: Math.max(...prices) };
}

export function totalInStock(c: Compound): number {
  return c.variants.reduce((sum, v) => sum + v.inStock, 0);
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
  wolverine: "wolverine.png",
  "cjc-1295-ipamorelin": "cjc-1295-ipamorelin.png",
  retatrutide: "retatrutide.png",
  tirzepatide: "tirzepatide.png",
  "glow-70": "glow-70.png",
  ipamorelin: "ipamorelin.png",
  kpv: "kpv.png",
  mazdutide: "mazdutide.png",
  "5-amino-1mq": "5-amino-1mq.png",
  glutathione: "glutathione.png",
  "pt-141": "pt-141.png",
  "melanotan-2": "melanotan-2.png",
  "bac-water": "bac-water.png",
  "igf-1-lr3": "igf-1-lr3.png",
};

export function compoundHasPhoto(c: Compound): boolean {
  return slugify(c.name) in COMPOUND_PHOTO;
}

export function compoundPhotoSrc(c: Compound): string {
  const file = COMPOUND_PHOTO[slugify(c.name)];
  return file ? `/images/compounds/${file}` : "/images/vial-base.png";
}
