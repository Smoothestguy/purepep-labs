import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

/**
 * Server-side Supabase client for RSCs, Route Handlers, and Server Actions.
 *
 * In Next 16, `cookies()` is async and must be awaited. `setAll` may be
 * called in contexts (Server Components) where writing cookies is disallowed
 * — we swallow that error; the proxy/middleware session-refresh pass handles
 * cookie writes for us in that case.
 *
 * Env vars are read at call time — missing keys only throw when this client
 * is actually invoked, so `next build` succeeds without Supabase provisioned.
 */
export async function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Supabase env vars missing. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local.",
    );
  }

  const cookieStore = await cookies();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Called from a Server Component — safe to ignore if a proxy
          // is refreshing sessions upstream.
        }
      },
    },
  });
}
