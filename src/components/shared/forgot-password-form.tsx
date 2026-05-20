"use client";

import { useState, useTransition } from "react";
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

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [isPending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    startTransition(async () => {
      try {
        const supabase = createClient();
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });

        if (error) {
          toast.error(error.message);
          return;
        }

        setSent(true);
        toast.success("Check your inbox for the reset link.");
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Unable to send reset link.";
        toast.error(message);
      }
    });
  }

  if (sent) {
    return (
      <div className="border border-hairline p-5 font-mono text-sm leading-relaxed text-muted-foreground">
        <p className="text-foreground" style={{ marginBottom: "0.5rem" }}>
          ✓ Reset link sent.
        </p>
        <p>
          If an account exists for{" "}
          <span className="text-foreground">{email}</span>, a password reset
          email is on its way. The link expires in 1 hour.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5" noValidate>
      <div>
        <label htmlFor="forgot-email" className={labelClasses} style={labelStyle}>
          Email
        </label>
        <div className="border border-hairline">
          <input
            id="forgot-email"
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
        {isPending ? "Sending…" : "Send reset link"}
      </button>
    </form>
  );
}
