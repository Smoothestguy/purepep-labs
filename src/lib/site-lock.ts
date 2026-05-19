// Shopify-style site password gate — shared between the proxy and the
// `/password` server action so both compute the same cookie value.

export const UNLOCK_COOKIE = "pp_site_unlock";
export const UNLOCK_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days

const encoder = new TextEncoder();

export async function hashPassword(password: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", encoder.encode(password));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function isSiteLocked(): boolean {
  return process.env.SITE_LOCKED === "true";
}

// Constant-time string compare so a timing side-channel can't leak length /
// prefix matches of the expected hash.
export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}
