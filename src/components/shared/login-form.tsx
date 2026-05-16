"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    startTransition(async () => {
      try {
        const supabase = createClient();
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          toast.error(error.message);
          return;
        }

        toast.success("Signed in.");
        const raw = searchParams.get("redirect");
        const redirectTo =
          raw && raw.startsWith("/") && !raw.startsWith("//") ? raw : "/shop";
        router.push(redirectTo);
        router.refresh();
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Unable to sign in.";
        toast.error(message);
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5" noValidate>
      <div>
        <label htmlFor="login-email" className={labelClasses} style={labelStyle}>
          Email
        </label>
        <div className="border border-hairline">
          <input
            id="login-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="researcher@lab.institute"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClasses + " w-full"}
            style={inputStyle}
            disabled={isPending}
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="login-password"
          className={labelClasses}
          style={labelStyle}
        >
          Password
        </label>
        <div className="border border-hairline">
          <input
            id="login-password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            placeholder="••••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClasses + " w-full"}
            style={inputStyle}
            disabled={isPending}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="whitespace-nowrap border border-hairline bg-brand font-mono tracking-[0.3em] uppercase text-brand-foreground transition-colors hover:bg-foreground hover:text-background disabled:cursor-not-allowed disabled:opacity-60"
        style={{
          paddingInline: "clamp(0.9rem, 1.5vw, 1.25rem)",
          paddingBlock: "clamp(0.75rem, 1vw, 0.95rem)",
          fontSize: "clamp(10px, 0.3vw + 9px, 11px)",
        }}
      >
        {isPending ? "Authenticating…" : "Sign in"}
      </button>
    </form>
  );
}
