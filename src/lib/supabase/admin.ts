import "server-only";

import { createClient } from "@supabase/supabase-js";

/**
 * Service-role Supabase client — bypasses Row Level Security.
 *
 * This key can read and write every row in the database, so it must never
 * reach the browser. The `server-only` import above turns any accidental
 * client-side import into a build error rather than a live key leak.
 *
 * Used for the two things RLS deliberately forbids from the client:
 *   - writing order rows during checkout (orders have no INSERT policy)
 *   - reading all orders for the admin dashboard
 *
 * Returns null when unconfigured so `next build` and local dev stay green
 * before Supabase is provisioned; callers must handle the null.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) return null;

  return createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
