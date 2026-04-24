import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser-side Supabase client. Reads cookies set by the proxy/middleware
 * session-refresh step.
 *
 * Env vars are read at call time (not module-eval time) so that missing keys
 * only throw when the client is actually used — this keeps `next build`
 * working in environments where Supabase isn't provisioned yet.
 */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Supabase env vars missing. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local.",
    );
  }

  return createBrowserClient(url, anonKey);
}
