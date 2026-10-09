/**
 * Sanitise a `?redirect=` value before navigating to it.
 *
 * Only same-origin paths are allowed. Without the `//` check an attacker
 * could pass `//evil.com`, which browsers treat as a protocol-relative
 * URL and follow off-site — an open redirect hung off our own login page,
 * which is exactly the shape used to make phishing links look legitimate.
 *
 * Shared so the login form, the register form, and the server-side
 * already-signed-in guards all apply the same rule.
 */
export const DEFAULT_REDIRECT = "/shop";

export function safeRedirectTarget(
  // `null` covers URLSearchParams.get(); the array form covers a Next.js
  // searchParams prop, where a repeated key arrives as string[].
  raw: string | string[] | null | undefined,
  fallback: string = DEFAULT_REDIRECT,
): string {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (!value) return fallback;
  if (!value.startsWith("/")) return fallback;
  if (value.startsWith("//")) return fallback;
  return value;
}
