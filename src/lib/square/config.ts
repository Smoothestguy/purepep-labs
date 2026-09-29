import "server-only";

/**
 * Square configuration.
 *
 * Square has two completely separate environments with their own tokens,
 * their own webhook signature keys and their own dashboards — the same
 * split Stripe has between test and live. `SQUARE_ENV` picks which base
 * URL the access token is used against; getting that pair mismatched
 * produces an authentication error on every call.
 *
 * The API version is pinned. Square dates its versions and changes
 * response shapes between them, so letting it float would mean the
 * account silently starts receiving a different payload one day.
 */

export const SQUARE_API_VERSION = "2026-09-16";

const PRODUCTION = "https://connect.squareup.com";
const SANDBOX = "https://connect.squareupsandbox.com";

export function squareBaseUrl(): string {
  return process.env.SQUARE_ENV?.trim() === "sandbox" ? SANDBOX : PRODUCTION;
}

export function squareAccessToken(): string | undefined {
  return process.env.SQUARE_ACCESS_TOKEN?.trim() || undefined;
}

export function squareSignatureKey(): string | undefined {
  return process.env.SQUARE_WEBHOOK_SIGNATURE_KEY?.trim() || undefined;
}

/**
 * The notification URL exactly as registered in Square's dashboard.
 *
 * This is part of the signature Square computes, so it has to match
 * character for character — a trailing slash or http/https mismatch makes
 * every delivery fail verification.
 */
export function squareNotificationUrl(): string | undefined {
  return process.env.SQUARE_WEBHOOK_URL?.trim() || undefined;
}

export function isSquareConfigured(): boolean {
  return Boolean(squareAccessToken());
}

export function squareHeaders(): Record<string, string> {
  return {
    Authorization: `Bearer ${squareAccessToken() ?? ""}`,
    "Square-Version": SQUARE_API_VERSION,
    "Content-Type": "application/json",
  };
}
