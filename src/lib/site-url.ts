import "server-only";

/**
 * Resolving this site's absolute origin.
 *
 * Anything that builds a URL pointing back at us — Stripe's return URLs,
 * the logo in transactional email — needs an absolute origin, and getting
 * it from the request is unsafe: the `Host` header is set by the caller,
 * so a poisoned value would send paying customers (or mail recipients) to
 * someone else's site.
 *
 * Resolution order, most trustworthy first:
 *
 *   1. NEXT_PUBLIC_SITE_URL — explicit config always wins.
 *   2. Vercel's own system variables. Vercel sets these, not the client,
 *      so they are safe. On production we prefer
 *      VERCEL_PROJECT_PRODUCTION_URL (the custom domain) over VERCEL_URL
 *      (an opaque *.vercel.app deployment host); on preview we want
 *      VERCEL_URL, which points at the deployment actually being used.
 *   3. The request origin — development only, where the Host header is
 *      not a threat and hardcoding localhost would be wrong.
 *
 * Both Vercel variables are bare hostnames with no scheme, hence the
 * explicit https:// prefix.
 *
 * Returns null when nothing can be resolved. Callers must treat that as a
 * misconfiguration rather than guessing.
 */
export function resolveSiteOrigin(requestOrigin?: string): string | null {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) return stripTrailingSlash(configured);

  const vercelHost =
    process.env.VERCEL_ENV === "production"
      ? process.env.VERCEL_PROJECT_PRODUCTION_URL
      : process.env.VERCEL_URL;

  if (vercelHost?.trim()) return `https://${stripTrailingSlash(vercelHost.trim())}`;

  if (process.env.NODE_ENV !== "production" && requestOrigin) {
    return stripTrailingSlash(requestOrigin);
  }

  return null;
}

function stripTrailingSlash(value: string): string {
  return value.replace(/\/+$/, "");
}
