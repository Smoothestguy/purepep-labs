"use client";

import { useState } from "react";
import { toast } from "sonner";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (pending) return;

    setPending(true);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        toast.success("Subscribed.");
        setEmail("");
      } else {
        let message = "Could not subscribe.";
        try {
          const data = (await res.json()) as { error?: string };
          if (data?.error) message = data.error;
        } catch {
          // fall through with default message
        }
        toast.error(message);
      }
    } catch {
      toast.error("Network error. Try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="flex w-full max-w-md items-stretch border border-hairline"
      style={{ minWidth: "min(100%, 22rem)" }}
    >
      <label htmlFor="newsletter" className="sr-only">
        Email address
      </label>
      <input
        id="newsletter"
        type="email"
        name="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={pending}
        placeholder="researcher@lab.institute"
        className="min-w-0 flex-1 bg-transparent font-mono tracking-[0.05em] text-foreground placeholder:text-muted-foreground/60 focus:outline-none disabled:opacity-50"
        style={{
          paddingInline: "clamp(0.85rem, 1.3vw, 1.1rem)",
          paddingBlock: "clamp(0.7rem, 1vw, 0.9rem)",
          fontSize: "clamp(11px, 0.25vw + 10px, 12px)",
        }}
      />
      <button
        type="submit"
        disabled={pending}
        className="whitespace-nowrap border-l border-hairline bg-brand font-mono tracking-[0.3em] uppercase text-brand-foreground transition-colors hover:bg-foreground hover:text-background disabled:opacity-60"
        style={{
          paddingInline: "clamp(0.9rem, 1.5vw, 1.25rem)",
          fontSize: "clamp(10px, 0.3vw + 9px, 11px)",
        }}
      >
        {pending ? "Sending…" : "Enrol"}
      </button>
    </form>
  );
}
