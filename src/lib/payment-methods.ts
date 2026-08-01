/**
 * Payment methods offered at checkout.
 *
 * `card` runs through NMI and settles inside the checkout request.
 * `bank_transfer` and `crypto` settle out-of-band: the order is recorded
 * as pending, the customer gets instructions, and an operator marks it
 * paid once funds arrive.
 *
 * Which manual methods appear is driven by NEXT_PUBLIC_PAYMENT_METHODS
 * (comma-separated) so they can be switched on without a deploy. Card is
 * offered whenever a tokenization key is present. If nothing is enabled
 * the checkout says so rather than rendering a dead form.
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
 * Card is only offered when CollectJS has a key to tokenise with. Without
 * it the card fields cannot render, so showing the option would be a dead
 * end — better to hide it and leave the manual methods.
 */
export function cardEnabled(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_NMI_TOKENIZATION_KEY);
}

export function enabledMethods(): PaymentMethod[] {
  return [
    ...(cardEnabled() ? (["card"] as const) : []),
    ...enabledManualMethods(),
  ];
}

export function isManual(m: PaymentMethod): m is ManualMethod {
  return m !== "card";
}
