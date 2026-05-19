import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import {
  UNLOCK_COOKIE,
  hashPassword,
  isSiteLocked,
  timingSafeEqual,
} from "@/lib/site-lock";

// Paths that must remain reachable even while the site is locked. The matcher
// below already excludes static assets and most API routes; this list covers
// the SEO/social surfaces and the gate itself.
const ALWAYS_ALLOWED_EXACT = new Set([
  "/sitemap.xml",
  "/robots.txt",
  "/opengraph-image",
  "/icon",
  "/favicon.ico",
]);

function isAllowedWhileLocked(pathname: string): boolean {
  if (pathname === "/password" || pathname.startsWith("/password/")) {
    return true;
  }
  if (ALWAYS_ALLOWED_EXACT.has(pathname)) return true;
  return false;
}

export async function proxy(request: NextRequest) {
  if (!isSiteLocked()) {
    return updateSession(request);
  }

  const { pathname, search } = request.nextUrl;

  if (isAllowedWhileLocked(pathname)) {
    return NextResponse.next();
  }

  const expected = process.env.SITE_PASSWORD;
  const cookieVal = request.cookies.get(UNLOCK_COOKIE)?.value;
  if (expected && cookieVal) {
    const expectedHash = await hashPassword(expected);
    if (timingSafeEqual(expectedHash, cookieVal)) {
      return updateSession(request);
    }
  }

  const url = request.nextUrl.clone();
  url.pathname = "/password";
  url.search = "";
  url.searchParams.set("next", pathname + search);
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: [
    /*
     * Run on every path except:
     * - _next/static (build assets)
     * - _next/image (image optimizer)
     * - api routes (handle their own auth)
     * - favicon and common static files (images, videos, fonts, models)
     */
    "/((?!_next/static|_next/image|api|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|mp4|webm|mov|m4v|ogg|glb|gltf|woff|woff2|ttf|otf)$).*)",
  ],
};
