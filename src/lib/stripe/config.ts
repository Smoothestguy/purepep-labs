import "server-only";

import Stripe from "stripe";

/**
 * Stripe client construction.
 *
 * We deliberately do not pass `apiVersion`. The SDK pins the version its
 * own types were generated against (2026-07-29.dahlia for stripe@22), so
 * hardcoding a string here buys nothing and breaks the build on the next
 * SDK bump when the literal no longer matches `LatestApiVersion`.
 *
 * The client is built lazily and cached, matching the Supabase and Resend
 * clients in this codebase: `next build` has to succeed on a machine with
 * no Stripe key provisioned.
 */

let cached: Stripe | null = null;

function secretKey(): string | undefined {
  return process.env.STRIPE_SECRET_KEY?.trim() || undefined;
}

export function isStripeConfigured(): boolean {
  return Boolean(secretKey());
}

/** Null when STRIPE_SECRET_KEY is unset — every caller must handle it. */
export function stripeClient(): Stripe | null {
  const key = secretKey();
  if (!key) return null;
  cached ??= new Stripe(key, { typescript: true });
  return cached;
}

/**
 * True when running against live keys.
 *
 * Worth surfacing in logs: a test-key checkout that "succeeds" moves no
 * money, and confusing the two is the classic way to ship a store that
 * cheerfully confirms orders it was never paid for.
 */
export function isStripeLive(): boolean {
  return secretKey()?.startsWith("sk_live_") ?? false;
}

export function stripeWebhookSecret(): string | undefined {
  return process.env.STRIPE_WEBHOOK_SECRET?.trim() || undefined;
}
