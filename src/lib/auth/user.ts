import "server-only";

import { createClient } from "@/lib/supabase/server";

/**
 * The signed-in researcher, as far as the server is concerned.
 *
 * Uses `auth.getUser()` rather than `auth.getSession()` on purpose:
 * getUser revalidates the JWT against Supabase, while getSession trusts
 * whatever is in the cookie. Only the former is safe to gate a purchase
 * on — this is an authorization check, not a UI hint.
 */
export type SessionUser = { id: string; email: string };

export async function getCurrentUser(): Promise<SessionUser | null> {
  let user: { id: string; email?: string } | null = null;
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch {
    // Supabase env not provisioned — nobody is signed in.
    return null;
  }

  if (!user?.email) return null;
  return { id: user.id, email: user.email };
}
