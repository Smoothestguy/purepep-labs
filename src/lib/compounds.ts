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
  category: "regenerative" | "metabolic" | "nootropic" | "longevity";
  family: string;
  blurb: string;
  lot: string;
  coaDate: string;
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
    category: "regenerative",
    family: "Pentadecapeptide",
    blurb:
      "Gastric pentadecapeptide. Synthesised and freeze-dried under inert argon.",
    lot: "A-4418",
    coaDate: "2026-03-14",
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
    category: "regenerative",
    family: "Thymosin fragment",
    blurb:
      "Actin-sequestering peptide fragment. Lyophilised, sealed at 18 °C.",
    lot: "A-4420",
    coaDate: "2026-03-17",
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
    category: "longevity",
    family: "Copper tripeptide",
    blurb: "Endogenous tripeptide–copper complex. Royal blue lyophilisate.",
    lot: "B-1904",
    coaDate: "2026-03-09",
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
    blurb: "Synthetic analogue of ACTH(4-10). BDNF upregulation studied.",
    lot: "C-0312",
    coaDate: "2026-03-22",
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
    category: "longevity",
    family: "Tetrapeptide",
    blurb: "Telomerase-associated tetrapeptide. Isolated from bovine pineal.",
    lot: "B-1911",
    coaDate: "2026-03-11",
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
  },
];

export const categories = [
  { key: "regenerative", label: "Regenerative" },
  { key: "metabolic", label: "Metabolic" },
  { key: "nootropic", label: "Nootropic" },
  { key: "longevity", label: "Longevity" },
] as const;

export function slugify(name: string): string {
  return name.toLowerCase().replaceAll(/\s+/g, "-");
}

export function compoundBySlug(slug: string): Compound | undefined {
  return compounds.find((c) => slugify(c.name) === slug);
}
