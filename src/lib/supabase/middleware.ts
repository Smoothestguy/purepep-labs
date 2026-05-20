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
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) {
    // Surfaces invalid env or unreachable Supabase in Vercel runtime logs
    // without breaking the flow — getUser still returns user: null.
    console.warn("[supabase] getUser error:", error.message);
  }

  // Gate inventory routes behind auth. Public surface: marketing home, auth
  // pages, legal pages, and metadata/SEO routes.
  const { pathname } = request.nextUrl;
  const isPublicPath =
    pathname === "/" ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/reset-password") ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/api/auth") ||
    pathname === "/research-use" ||
    pathname === "/terms" ||
    pathname === "/privacy" ||
    pathname === "/export-compliance" ||
    pathname === "/sitemap.xml" ||
    pathname === "/robots.txt" ||
    pathname === "/opengraph-image" ||
    pathname === "/icon";

  if (!user && !isPublicPath) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}
