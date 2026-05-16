"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import type { User } from "@supabase/supabase-js";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

type Props = {
  variant?: "desktop" | "mobile";
  onNavigate?: () => void;
};

export function AuthButton({ variant = "desktop", onNavigate }: Props) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    let active = true;
    let unsubscribe: (() => void) | undefined;

    try {
      const supabase = createClient();

      supabase.auth.getUser().then(({ data }) => {
        if (!active) return;
        setUser(data.user ?? null);
        setLoading(false);
      });

      const { data: sub } = supabase.auth.onAuthStateChange(
        (_event, session) => {
          setUser(session?.user ?? null);
        },
      );
      unsubscribe = () => sub.subscription.unsubscribe();
    } catch {
      // Supabase env not configured yet — render the signed-out state.
      setLoading(false);
    }

    return () => {
      active = false;
      unsubscribe?.();
    };
  }, []);

  function handleSignOut() {
    startTransition(async () => {
      try {
        const supabase = createClient();
        const { error } = await supabase.auth.signOut();
        if (error) {
          toast.error(error.message);
          return;
        }
        toast.success("Signed out.");
        onNavigate?.();
        router.refresh();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Unable to sign out.");
      }
    });
  }

  if (variant === "mobile") {
    if (loading) {
      return <div className="h-14 border border-transparent" aria-hidden />;
    }
    if (!user) {
      return (
        <Link
          href="/login"
          onClick={onNavigate}
          className="inline-flex items-center justify-center gap-3 border border-hairline py-4 font-mono text-[11px] tracking-[0.3em] uppercase text-foreground transition-colors hover:border-foreground"
        >
          Researcher log-in
        </Link>
      );
    }
    return (
      <div className="flex flex-col gap-2">
        <span
          className="truncate text-center font-mono text-[10px] tracking-[0.3em] uppercase text-muted-foreground"
          title={user.email ?? ""}
        >
          {user.email}
        </span>
        <button
          type="button"
          onClick={handleSignOut}
          disabled={isPending}
          className="inline-flex items-center justify-center gap-3 border border-hairline py-4 font-mono text-[11px] tracking-[0.3em] uppercase text-foreground transition-colors hover:border-foreground disabled:opacity-60"
        >
          {isPending ? "Signing out…" : "Sign out"}
        </button>
      </div>
    );
  }

  // desktop
  if (loading) {
    return <span className="hidden xl:inline-block min-w-[10rem]" aria-hidden />;
  }
  if (!user) {
    return (
      <Link
        href="/login"
        className="hidden whitespace-nowrap font-mono text-[11px] tracking-[0.22em] uppercase text-muted-foreground transition-colors hover:text-foreground xl:inline"
      >
        Researcher log-in
      </Link>
    );
  }
  return (
    <div className="hidden items-center gap-3 xl:flex">
      <span
        className="max-w-[14rem] truncate font-mono text-[11px] tracking-[0.22em] uppercase text-muted-foreground"
        title={user.email ?? ""}
      >
        {user.email}
      </span>
      <span className="text-muted-foreground/40">·</span>
      <button
        type="button"
        onClick={handleSignOut}
        disabled={isPending}
        className="whitespace-nowrap font-mono text-[11px] tracking-[0.22em] uppercase text-muted-foreground transition-colors hover:text-foreground disabled:opacity-60"
      >
        {isPending ? "Signing out…" : "Sign out"}
      </button>
    </div>
  );
}
