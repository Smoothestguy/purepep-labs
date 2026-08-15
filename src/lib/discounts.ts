import "server-only";

/**
 * Discount codes.
 *
 * Codes live in `DISCOUNT_CODES` as `CODE:PERCENT` pairs, comma separated:
 *
 *   DISCOUNT_CODES=HTOWN:15,SOMECOMP:100
 *
 * Server-only, for two reasons: a code committed to source is public the
 * moment the repo is, and env lets one be revoked or rotated without a
 * code change. The browser is never handed the list — it can only ask
 * about a code someone actually typed.
 *
 * A 100% code is a comp: the order total reaches zero, no processor is
 * involved, and checkout settles it directly. Anything below 100 goes
 * through the normal card flow at the reduced amount.
 *
 * Matching is case-insensitive and trimmed, because these get typed by
 * hand and pasted out of emails.
 */

export type Discount = {
  /** Canonical spelling, as configured. */
  code: string;
  /** Whole percent off, 1–100. */
  percent: number;
};

function parseCodes(): Discount[] {
  const raw = process.env.DISCOUNT_CODES ?? "";

  return raw
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .flatMap((entry) => {
      // rsplit on ':' so a code containing a colon still parses — the
      // percent is always the final segment.
      const idx = entry.lastIndexOf(":");
      if (idx <= 0) {
        console.warn(
          `[discounts] ignoring "${entry}" — expected CODE:PERCENT.`,
        );
        return [];
      }

      const code = entry.slice(0, idx).trim();
      const percent = Number(entry.slice(idx + 1).trim());

      if (
        !code ||
        !Number.isInteger(percent) ||
        percent < 1 ||
        percent > 100
      ) {
        console.warn(
          `[discounts] ignoring "${entry}" — percent must be an integer 1–100.`,
        );
        return [];
      }

      return [{ code, percent }];
    });
}

/**
 * Resolve a customer-entered code.
 *
 * Returns the *configured* spelling rather than what was typed, so
 * everything downstream — the order row, the logs — records the canonical
 * code and never echoes raw user input.
 */
export function lookupDiscount(input: unknown): Discount | null {
  if (typeof input !== "string") return null;
  const needle = input.trim().toLowerCase();
  if (!needle) return null;

  return parseCodes().find((d) => d.code.toLowerCase() === needle) ?? null;
}
