"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/shared/auth-provider";

type Props = {
  variant?: "desktop" | "mobile";
  onNavigate?: () => void;
};

export function AuthButton({ variant = "desktop", onNavigate }: Props) {
  const router = useRouter();
  // Session comes from the shared provider — see components/shared/auth-provider.
  const { user, loading } = useAuth();
  const [isPending, startTransition] = useTransition();

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
