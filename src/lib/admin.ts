import "server-only";

import { createClient } from "@/lib/supabase/server";

/**
 * Admin access control.
 *
 * Admins are an explicit allowlist in `ADMIN_EMAILS` (comma-separated)
 * rather than a database role. For a team of one or two that avoids a
 * roles table plus the RLS policies to protect it, and it cannot be
 * escalated by anything an attacker does inside the app — changing who is
 * an admin requires access to the deployment's environment variables.
 *
 * Emails are compared case-insensitively against the *verified* address on
 * the Supabase session, never against user-supplied input.
 */
function allowlist(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(/[,\s]+/)
    // Values pasted into a dashboard or piped through a CLI can pick up
    // wrapping quotes or stray whitespace; neither belongs in an email.
    .map((e) => e.replace(/^["']+|["']+$/g, "").trim().toLowerCase())
    .filter(Boolean);
}

export type AdminUser = { id: string; email: string };

/** Returns the signed-in admin, or null if not signed in / not an admin. */
export async function getAdminUser(): Promise<AdminUser | null> {
  const emails = allowlist();
  if (emails.length === 0) return null;

  let user: { id: string; email?: string } | null = null;
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch {
    return null;
  }

  const email = user?.email?.toLowerCase();
  if (!user || !email) return null;
  if (!emails.includes(email)) {
    // Signed in but not on the list. Log the shape of the allowlist — never
    // its contents — so a misconfigured ADMIN_EMAILS can be diagnosed from
    // the runtime logs without exposing who the admins are.
    console.warn(
      `[admin] refused a signed-in user; allowlist has ${emails.length} entr${
        emails.length === 1 ? "y" : "ies"
      } (lengths: ${emails.map((e) => e.length).join(", ") || "none"}), signed-in email length ${email.length}`,
    );
    return null;
  }

  return { id: user.id, email };
}
