import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// NOTE: Next 16 deprecates the `middleware` file-convention in favor of
// `proxy.ts`, but the legacy `middleware.ts` filename still works (see
// node_modules/next/dist/lib/constants.js `MIDDLEWARE_FILENAME`). We keep
// the original name per task spec; migrate with `npx @next/codemod@canary
// middleware-to-proxy .` when ready.
export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Run on every path except:
     * - _next/static (build assets)
     * - _next/image (image optimizer)
     * - api routes (handle their own auth)
     * - favicon and common static files (ico, png, svg, jpg, jpeg, gif, webp)
     */
    "/((?!_next/static|_next/image|api|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
