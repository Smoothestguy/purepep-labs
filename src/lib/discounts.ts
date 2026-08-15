import "server-only";

/**
 * Comp codes — a code that makes an order free.
 *
 * Codes live in the `DISCOUNT_CODES` environment variable, comma
 * separated, and are read server-side only. Two reasons they are not in
 * source: a code committed to git is public the moment the repo is, and
 * env lets you revoke or rotate one without a deploy.
 *
 * Scope is deliberately full comps, not percentages. A partial discount
 * has to be represented on Stripe's side too — otherwise the hosted page
 * charges the undiscounted total while our order record says otherwise —
 * and doing that properly means creating Stripe Coupon objects. A 100%
 * comp sidesteps that entirely by never involving Stripe: the order is
 * settled here, since there is nothing to charge.
 *
 * Matching is case-insensitive and trimmed, because these get typed by
 * hand and pasted out of emails.
 */

export type CompCode = { code: string };

function configuredCodes(): string[] {
  return (process.env.DISCOUNT_CODES ?? "")
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean);
}

/** Whether any comp code is configured at all. */
export function compCodesEnabled(): boolean {
  return configuredCodes().length > 0;
}

/**
 * Resolve a customer-entered code.
 *
 * Returns the *configured* spelling rather than what was typed, so the
 * order record shows the canonical code regardless of how it was entered.
 */
export function lookupCompCode(input: unknown): CompCode | null {
  if (typeof input !== "string") return null;
  const needle = input.trim().toLowerCase();
  if (!needle) return null;

  const match = configuredCodes().find((c) => c.toLowerCase() === needle);
  return match ? { code: match } : null;
}
