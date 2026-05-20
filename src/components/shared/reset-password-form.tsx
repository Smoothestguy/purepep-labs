"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

const inputClasses =
  "min-w-0 flex-1 bg-transparent font-mono tracking-[0.05em] text-foreground placeholder:text-muted-foreground/60 focus:outline-none";

const inputStyle: React.CSSProperties = {
  paddingInline: "clamp(0.85rem, 1.3vw, 1.1rem)",
  paddingBlock: "clamp(0.7rem, 1vw, 0.9rem)",
  fontSize: "clamp(11px, 0.25vw + 10px, 12px)",
};

const labelClasses =
  "block font-mono tracking-[0.3em] uppercase text-muted-foreground";

const labelStyle: React.CSSProperties = {
  fontSize: "clamp(9.5px, 0.25vw + 8.5px, 10.5px)",
  marginBottom: "clamp(0.5rem, 0.8vw, 0.65rem)",
};

export function ResetPasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [isPending, startTransition] = useTransition();
  const [sessionReady, setSessionReady] = useState<boolean | null>(null);

  // Supabase delivers the recovery token in the URL hash (#access_token=...).
  // The supabase-js client detects it and establishes a session automatically
  // — we just need to wait for that to complete before the user can submit.
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => {
      setSessionReady(Boolean(data.session));
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
        setSessionReady(true);
      }
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      toast.error("Passwords don't match.");
      return;
    }

    startTransition(async () => {
      try {
        const supabase = createClient();
        const { error } = await supabase.auth.updateUser({ password });
        if (error) {
          toast.error(error.message);
          return;
        }
        toast.success("Password updated. You're signed in.");
        router.push("/shop");
        router.refresh();
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Unable to update password.";
        toast.error(message);
      }
    });
  }

  if (sessionReady === false) {
    return (
      <div className="border border-hairline p-5 font-mono text-sm leading-relaxed text-muted-foreground">
        <p className="text-foreground" style={{ marginBottom: "0.5rem" }}>
          Link expired or invalid.
        </p>
        <p>
          Password reset links expire after one hour and can only be used once.
          Request a fresh link from the{" "}
          <a
            href="/forgot-password"
            className="text-brand underline-offset-4 hover:underline"
          >
            recovery page
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5" noValidate>
      <div>
        <label
          htmlFor="new-password"
          className={labelClasses}
          style={labelStyle}
        >
          New password
        </label>
        <div className="border border-hairline">
          <input
            id="new-password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            placeholder="••••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClasses + " w-full"}
            style={inputStyle}
            disabled={isPending || sessionReady !== true}
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="confirm-password"
          className={labelClasses}
          style={labelStyle}
        >
          Confirm new password
        </label>
        <div className="border border-hairline">
          <input
            id="confirm-password"
            name="confirm"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            placeholder="••••••••••"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className={inputClasses + " w-full"}
            style={inputStyle}
            disabled={isPending || sessionReady !== true}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending || sessionReady !== true}
        className="whitespace-nowrap border border-hairline bg-brand font-mono tracking-[0.3em] uppercase text-brand-foreground transition-colors hover:bg-foreground hover:text-background disabled:cursor-not-allowed disabled:opacity-60"
        style={{
          paddingInline: "clamp(0.9rem, 1.5vw, 1.25rem)",
          paddingBlock: "clamp(0.75rem, 1vw, 0.95rem)",
          fontSize: "clamp(10px, 0.3vw + 9px, 11px)",
        }}
      >
        {sessionReady === null
          ? "Verifying link…"
          : isPending
            ? "Updating…"
            : "Update password"}
      </button>
    </form>
  );
}
