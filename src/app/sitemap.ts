import type { MetadataRoute } from "next";

const BASE_URL = "https://thepurepep.com";

const PRODUCT_SLUGS = [
  "bpc-157",
  "tb-500",
  "ghk-cu",
  "semax",
  "selank",
  "tesamorelin",
  "epitalon",
  "mots-c",
] as const;

// Storefront filter keys — kept in step with catalogFilters() in
// lib/compounds. The old physiological categories are gone from here too,
// so search engines stop being handed those URLs.
const CATEGORIES = [
  "certified",
  "blends",
  "peptides",
  "supplies",
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const entries: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}/`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/shop`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    ...CATEGORIES.map(
      (cat): MetadataRoute.Sitemap[number] => ({
        url: `${BASE_URL}/shop?category=${cat}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.7,
      }),
    ),
    ...PRODUCT_SLUGS.map(
      (slug): MetadataRoute.Sitemap[number] => ({
        url: `${BASE_URL}/product/${slug}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.8,
      }),
    ),
    {
      url: `${BASE_URL}/coa`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/login`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/register`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/terms`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/privacy`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/research-use`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/export-compliance`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  return entries;
}
