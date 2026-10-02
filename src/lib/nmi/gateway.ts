import "server-only";

import type { CheckoutShipping } from "@/lib/checkout/types";
import { transactUrl } from "./config";

/**
 * Server-side NMI Direct Post (transact.php) client.
 *
 * Flow: the browser tokenises the card with CollectJS and never sends card
 * data to us. We exchange that one-time token for a sale here, using the
 * server-only `NMI_SECURITY_KEY`.
 *
 * Both the request and the response are x-www-form-urlencoded — NMI's API
 * predates JSON and still speaks form encoding in both directions.
 *
 * Verified against NMI's sandbox: a $57.99 sale returned response=1 with
 * an auth code and transaction id, confirming the request encoding and the
 * response parsing below. The endpoint origin is configurable — sandbox
 * accounts are rejected by the production host and vice versa (see config).
 */

/** Abort the gateway call rather than hang a checkout request forever. */
const TIMEOUT_MS = 20_000;

export function isGatewayConfigured(): boolean {
  return Boolean(process.env.NMI_SECURITY_KEY);
}

export type ChargeInput = {
  token: string;
  amountCents: number;
  email: string;
  shipping: CheckoutShipping;
  orderRef: string;
};

export type ChargeResult =
  | {
      ok: true;
      transactionId: string;
      authCode: string;
      raw: Record<string, string>;
    }
  | {
      ok: false;
      /** Customer-safe message. */
      message: string;
      /** "declined" | "error" | "network" — for logging, not for display. */
      kind: "declined" | "error" | "network";
      raw?: Record<string, string>;
    };

/** NMI returns `response=1|2|3` for approved | declined | error. */
function parseFormEncoded(body: string): Record<string, string> {
  const params = new URLSearchParams(body);
  const out: Record<string, string> = {};
  for (const [k, v] of params.entries()) out[k] = v;
  return out;
}

export async function chargeCard(input: ChargeInput): Promise<ChargeResult> {
  const securityKey = process.env.NMI_SECURITY_KEY;
  if (!securityKey) {
    return {
      ok: false,
      kind: "error",
      message: "Payment gateway is not configured.",
    };
  }

  const { shipping } = input;

  const form = new URLSearchParams({
    security_key: securityKey,
    type: "sale",
    payment_token: input.token,
    // NMI expects a decimal string in major units, e.g. "137.97".
    amount: (input.amountCents / 100).toFixed(2),
    currency: "USD",
    orderid: input.orderRef,
    email: input.email,
    first_name: shipping.firstName,
    last_name: shipping.lastName,
    address1: shipping.address1,
    city: shipping.city,
    state: shipping.state,
    zip: shipping.zip,
    country: "US",
    phone: shipping.phone,
  });

  if (shipping.address2) form.set("address2", shipping.address2);

  let raw: Record<string, string>;
  try {
    const res = await fetch(transactUrl(), {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: form.toString(),
      signal: AbortSignal.timeout(TIMEOUT_MS),
      cache: "no-store",
    });

    if (!res.ok) {
      return {
        ok: false,
        kind: "network",
        message: "Could not reach the payment processor. Please try again.",
      };
    }

    raw = parseFormEncoded(await res.text());
  } catch {
    // Timeout or transport failure. The sale may or may not have gone
    // through — surface it as a failure and reconcile from the NMI portal
    // rather than silently retrying and risking a double charge.
    return {
      ok: false,
      kind: "network",
      message: "Could not reach the payment processor. Please try again.",
    };
  }

  if (raw.response === "1") {
    return {
      ok: true,
      transactionId: raw.transactionid ?? "",
      authCode: raw.authcode ?? "",
      raw,
    };
  }

  // 2 = declined, 3 = gateway/validation error. Show the processor's text
  // when it is present; it is written for cardholders ("Card declined").
  return {
    ok: false,
    kind: raw.response === "2" ? "declined" : "error",
    message: raw.responsetext || "The payment was declined.",
    raw,
  };
}
