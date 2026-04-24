import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * Session-refresh pass for the Next.js proxy/middleware.
 *
 * Supabase's `@supabase/ssr` requires that a middleware refresh sessions
 * before any page renders — otherwise the RSC client can hit expired tokens
 * without a way to write updated cookies back to the browser.
 *
 * Pattern: mirror cookies onto both the incoming `request` (so downstream
 * handlers see fresh values) and the outgoing `response` (so the browser
 * receives updated Set-Cookie headers).
 *
 * If env vars are missing we short-circuit with a pass-through response —
 * this keeps local dev + `next build` green before Supabase is provisioned.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request,
  });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    // No Supabase configured — do nothing, let the request pass through.
    return response;
  }

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        response = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  // Touching getUser() forces a session refresh if the access token is near
  // expiry, triggering `setAll` above and writing refreshed cookies onto
  // both the request and response.
  await supabase.auth.getUser();

  return response;
}
