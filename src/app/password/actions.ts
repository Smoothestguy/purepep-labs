"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  UNLOCK_COOKIE,
  UNLOCK_MAX_AGE_SECONDS,
  hashPassword,
  timingSafeEqual,
} from "@/lib/site-lock";

// --- Staff password unlock -------------------------------------------------

export async function unlock(formData: FormData) {
  const submitted = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/");
  const expected = process.env.SITE_PASSWORD ?? "";

  const expectedHash = expected ? await hashPassword(expected) : "";
  const submittedHash = submitted ? await hashPassword(submitted) : "";
  const ok =
    expectedHash.length > 0 && timingSafeEqual(expectedHash, submittedHash);

  if (!ok) {
    redirect(`/password?error=1&next=${encodeURIComponent(safeNext(next))}`);
  }

  const jar = await cookies();
  jar.set(UNLOCK_COOKIE, expectedHash, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: UNLOCK_MAX_AGE_SECONDS,
  });

  redirect(safeNext(next));
}

// --- Public waitlist signup ------------------------------------------------
//
// Stores notify-on-launch emails in Supabase. Run this once in the SQL editor
// to create the table:
//
//   create table if not exists public.waitlist (
//     id uuid primary key default gen_random_uuid(),
//     email text not null unique,
//     created_at timestamptz not null default now(),
//     source text default 'maintenance-gate'
//   );
//   alter table public.waitlist enable row level security;
//   create policy "anon insert" on public.waitlist
//     for insert to anon
//     with check (true);

export async function joinWaitlist(formData: FormData) {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const next = String(formData.get("next") ?? "/");

  if (!isValidEmail(email)) {
    redirect(
      `/password?waitlist=invalid&next=${encodeURIComponent(safeNext(next))}`,
    );
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("waitlist")
      .insert({ email, source: "maintenance-gate" });

    // 23505 = unique_violation — treat repeat signups as success so we don't
    // leak that the email is already in the list.
    if (error && error.code !== "23505") {
      console.warn("[waitlist] insert error:", error.message);
      redirect(
        `/password?waitlist=error&next=${encodeURIComponent(safeNext(next))}`,
      );
    }
  } catch (err) {
    // Supabase not configured locally — still treat as success in dev so the
    // UI is demoable. Production should always have the env set.
    if (process.env.NODE_ENV === "production") {
      console.error("[waitlist] supabase unavailable:", err);
      redirect(
        `/password?waitlist=error&next=${encodeURIComponent(safeNext(next))}`,
      );
    }
  }

  redirect(
    `/password?waitlist=ok&next=${encodeURIComponent(safeNext(next))}`,
  );
}

// --- Helpers ---------------------------------------------------------------

function isValidEmail(email: string): boolean {
  if (email.length < 3 || email.length > 254) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Only honor same-origin relative paths so the gate can't be turned into an
// open redirect.
function safeNext(next: string): string {
  if (!next.startsWith("/") || next.startsWith("//")) return "/";
  return next;
}
