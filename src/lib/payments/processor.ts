import "server-only";

import { isStripeConfigured } from "@/lib/stripe/config";
import { methodsFor, type PaymentMethod } from "@/lib/payment-methods";

/**
 * Which processor handles card payments.
 *
 * Stripe is the default. The NMI integration is left in the tree —
 * switched off rather than deleted — so cards can be moved back with an
 * env change and a redeploy. For this catalog that is not hypothetical:
 * card processors do drop research-peptide merchants, and the recovery
 * path should not require writing code under pressure.
 *
 * Server-only: the decision depends on secret keys, so the checkout page
 * resolves it and passes the result down to the client form as props.
 */
export type CardProcessor = "stripe" | "nmi";

export function cardProcessor(): CardProcessor {
  return process.env.CARD_PROCESSOR?.trim() === "nmi" ? "nmi" : "stripe";
}

/**
 * Whether the active processor can actually take a card right now.
 *
 * For NMI this mirrors the old behaviour — the public tokenization key is
 * what decides whether card fields can render at all. For Stripe there is
 * no mock path on purpose: Stripe ships test keys for that, and a fake
 * approval against live keys is exactly the failure mode worth avoiding.
 */
export function isCardConfigured(): boolean {
  if (cardProcessor() === "nmi") {
    return Boolean(process.env.NEXT_PUBLIC_NMI_TOKENIZATION_KEY);
  }
  return isStripeConfigured();
}

/** Payment methods offered for this deployment, card availability included. */
export function enabledMethods(): PaymentMethod[] {
  return methodsFor(isCardConfigured());
}
