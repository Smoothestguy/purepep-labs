import "server-only";

import type { ManualMethod } from "@/lib/payment-methods";

/**
 * Payment instructions for out-of-band methods.
 *
 * The actual bank details and wallet addresses live in environment
 * variables, never in the repo — they are business data that changes
 * without a deploy, and bank details in git history is not a thing you
 * can undo.
 *
 * Server-only: instructions are rendered server-side and emailed, so they
 * never need to reach the client bundle.
 *
 * Set BANK_TRANSFER_INSTRUCTIONS / CRYPTO_INSTRUCTIONS to multi-line text.
 * Use \n for line breaks in a .env file, e.g.
 *   BANK_TRANSFER_INSTRUCTIONS="Bank: Example\nRouting: 000\nAccount: 000"
 */

const FALLBACK =
  "Payment details will be emailed to you shortly. If you do not receive them within one business day, reply to this email and we will resend.";

export function paymentInstructions(method: ManualMethod): string {
  const raw =
    method === "bank_transfer"
      ? process.env.BANK_TRANSFER_INSTRUCTIONS
      : process.env.CRYPTO_INSTRUCTIONS;

  const text = raw?.trim();
  if (!text) {
    console.warn(
      `[payments] no instructions configured for ${method} — set ${
        method === "bank_transfer"
          ? "BANK_TRANSFER_INSTRUCTIONS"
          : "CRYPTO_INSTRUCTIONS"
      }`,
    );
    return FALLBACK;
  }

  // Allow literal "\n" in .env values to mean a line break.
  return text.replaceAll("\\n", "\n");
}

export function hasInstructions(method: ManualMethod): boolean {
  const raw =
    method === "bank_transfer"
      ? process.env.BANK_TRANSFER_INSTRUCTIONS
      : process.env.CRYPTO_INSTRUCTIONS;
  return Boolean(raw?.trim());
}
