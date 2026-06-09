"use client";

import { useSearchParams } from "next/navigation";
import type { Compound, Variant } from "@/lib/compounds";
import { defaultVariant } from "@/lib/compounds";

/**
 * Reads the selected variant from the `?dose=` query string, falling back
 * to the compound's first variant. The picker updates the URL so this hook
 * is the single source of truth across every client island on the page.
 */
export function useSelectedVariant(c: Compound): Variant {
  const params = useSearchParams();
  const dose = params.get("dose");
  if (dose) {
    const found = c.variants.find((v) => v.dose === dose);
    if (found) return found;
  }
  return defaultVariant(c);
}
