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

export function RegisterForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [institution, setInstitution] = useState("");
  const [attest, setAttest] = useState(false);
  const [isPending, startTransition] = useTransition();

  const canSubmit = attest && !isPending;

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!attest) {
      toast.error("You must attest to research-only use to continue.");
      return;
    }

    startTransition(async () => {
      try {
        const supabase = createClient();
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              institution: institution || null,
              research_use_attested_at: new Date().toISOString(),
            },
          },
        });

        if (error) {
          toast.error(error.message);
          return;
        }

        toast.success("Check your inbox to confirm.");
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Unable to create account.";
        toast.error(message);
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5" noValidate>
      <div>
        <label
          htmlFor="register-email"
          className={labelClasses}
          style={labelStyle}
        >
          Email
        </label>
        <div className="border border-hairline">
          <input
            id="register-email"
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
          htmlFor="register-password"
          className={labelClasses}
          style={labelStyle}
        >
          Password
        </label>
        <div className="border border-hairline">
          <input
            id="register-password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            placeholder="minimum 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClasses + " w-full"}
            style={inputStyle}
            disabled={isPending}
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="register-institution"
          className={labelClasses}
          style={labelStyle}
        >
          Institution <span className="normal-case opacity-60">(optional)</span>
        </label>
        <div className="border border-hairline">
          <input
            id="register-institution"
            name="institution"
            type="text"
            autoComplete="organization"
            placeholder="Lab, university, or research group"
            value={institution}
            onChange={(e) => setInstitution(e.target.value)}
            className={inputClasses + " w-full"}
            style={inputStyle}
            disabled={isPending}
          />
        </div>
      </div>

      <label
        htmlFor="register-attest"
        className="flex cursor-pointer items-start gap-3 border border-hairline p-4 text-sm text-muted-foreground transition-colors hover:border-brand/50"
      >
        <input
          id="register-attest"
          name="attest"
          type="checkbox"
          required
          checked={attest}
          onChange={(e) => setAttest(e.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 accent-[color:var(--brand)]"
          disabled={isPending}
        />
        <span className="font-sans leading-relaxed">
          I attest this is for laboratory research use only and will not be
          administered to humans or animals.
        </span>
      </label>

      <button
        type="submit"
        disabled={!canSubmit}
        className="whitespace-nowrap border border-hairline bg-brand font-mono tracking-[0.3em] uppercase text-brand-foreground transition-colors hover:bg-foreground hover:text-background disabled:cursor-not-allowed disabled:opacity-60"
        style={{
          paddingInline: "clamp(0.9rem, 1.5vw, 1.25rem)",
          paddingBlock: "clamp(0.75rem, 1vw, 0.95rem)",
          fontSize: "clamp(10px, 0.3vw + 9px, 11px)",
        }}
      >
        {isPending ? "Submitting…" : "Open account"}
      </button>
    </form>
  );
}
