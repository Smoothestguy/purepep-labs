/**
 * NMI gateway host.
 *
 * One variable drives both the browser tokenization script and the
 * server-side sale. That is deliberate: if the browser tokenised against
 * sandbox while the server charged production (or vice versa), the token
 * would be rejected with an opaque error. Deriving both from a single
 * origin makes that mismatch impossible.
 *
 * Values:
 *   sandbox     https://sandbox.nmi.com
 *   production  https://secure.nmi.com   (default)
 *
 * ISO-issued white-label accounts often have their own branded gateway
 * origin — set it here rather than patching the code.
 *
 * NEXT_PUBLIC_ because the tokenization loader runs in the browser; the
 * host is not a secret (the keys are).
 */
const DEFAULT_HOST = "https://secure.nmi.com";

export function nmiHost(): string {
  const host = process.env.NEXT_PUBLIC_NMI_GATEWAY_HOST?.trim();
  return (host || DEFAULT_HOST).replace(/\/+$/, "");
}

/** CollectJS tokenization script — loaded in the browser. */
export function collectJsUrl(): string {
  return `${nmiHost()}/token/Collect.js`;
}

/** Direct Post sale endpoint — called server-side only. */
export function transactUrl(): string {
  return `${nmiHost()}/api/transact.php`;
}

export function isSandbox(): boolean {
  return nmiHost().includes("sandbox.");
}
