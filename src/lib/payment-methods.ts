/**
 * Payment methods offered at checkout.
 *
 * `card` is handled by whichever processor is active (Stripe by default,
 * NMI behind an env switch — see lib/payments/processor). `bank_transfer`
 * and `crypto` settle out-of-band: the order is recorded as pending, the
 * customer gets instructions, and an operator marks it paid once funds
 * arrive.
 *
 * Which manual methods appear is driven by NEXT_PUBLIC_PAYMENT_METHODS
 * (comma-separated) so they can be switched on without a deploy. If
 * nothing is enabled the checkout says so rather than rendering a dead
 * form.
 *
 * This module stays isomorphic — the client form imports the labels — so
 * it deliberately knows nothing about secret keys. Whether card is
 * actually available is decided server-side and passed in.
 */

export const PAYMENT_METHODS = ["card", "bank_transfer", "crypto"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export type ManualMethod = Exclude<PaymentMethod, "card">;

export function isPaymentMethod(v: unknown): v is PaymentMethod {
  return typeof v === "string" && (PAYMENT_METHODS as readonly string[]).includes(v);
}

export const METHOD_LABEL: Record<PaymentMethod, string> = {
  card: "Credit / debit card",
  bank_transfer: "Bank transfer (ACH / wire)",
  crypto: "Cryptocurrency",
};

export const METHOD_BLURB: Record<PaymentMethod, string> = {
  card: "Processed securely. Card details never touch our servers.",
  bank_transfer: "We email transfer details. Ships once funds clear — usually 1–2 business days.",
  crypto: "We email a wallet address. Ships once the transaction confirms.",
};

/** Manual methods switched on for this deployment. */
export function enabledManualMethods(): ManualMethod[] {
  const raw = process.env.NEXT_PUBLIC_PAYMENT_METHODS ?? "";
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter((s): s is ManualMethod => s === "bank_transfer" || s === "crypto");
}

/**
 * Assemble the offered methods.
 *
 * `cardAvailable` comes from the server (lib/payments/processor), because
 * deciding it requires reading a secret key. Offering a card option the
 * server would refuse is a dead end for the customer, so it is hidden
 * instead, leaving whatever manual methods are switched on.
 */
export function methodsFor(cardAvailable: boolean): PaymentMethod[] {
  return [
    ...(cardAvailable ? (["card"] as const) : []),
    ...enabledManualMethods(),
  ];
}

export function isManual(m: PaymentMethod): m is ManualMethod {
  return m !== "card";
}
