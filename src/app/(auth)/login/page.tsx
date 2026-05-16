import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { LoginForm } from "@/components/shared/login-form";

export const metadata: Metadata = {
  title: "Sign in — PurePep Labs",
  description: "Research-only access to the PurePep Labs catalog.",
};

export default function LoginPage() {
  return (
    <div className="flex flex-col">
      <div className="section-eyebrow">
        <span className="whitespace-nowrap text-brand">§ 07</span>
        <span className="h-px shrink-0 bg-hairline w-[clamp(1.5rem,3vw,2.75rem)]" />
        <span>Access</span>
      </div>

      <h1
        className="font-display leading-[0.95] tracking-[-0.02em]"
        style={{
          marginTop: "clamp(1rem, 1.5vw, 1.5rem)",
          fontSize: "clamp(1.875rem, 5vw, 3.5rem)",
        }}
      >
        Return to the{" "}
        <span className="italic text-gradient-brand">bench.</span>
      </h1>

      <p
        className="max-w-md font-sans leading-relaxed text-muted-foreground"
        style={{
          marginTop: "clamp(0.75rem, 1.2vw, 1.25rem)",
          fontSize: "clamp(0.85rem, 0.3vw + 0.77rem, 0.95rem)",
        }}
      >
        Research-only access. Sign in with the email your institution
        registered.
      </p>

      <div style={{ marginTop: "clamp(1.5rem, 3vw, 2.5rem)" }}>
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </div>

      <div
        className="flex flex-col border-t border-hairline font-mono tracking-[0.25em] uppercase text-muted-foreground sm:flex-row sm:items-center sm:justify-between"
        style={{
          marginTop: "clamp(2rem, 4vw, 3rem)",
          paddingTop: "clamp(1.25rem, 2vw, 1.75rem)",
          gap: "0.75rem",
          fontSize: "clamp(9.5px, 0.25vw + 8.5px, 10.5px)",
        }}
      >
        <Link
          href="/login"
          className="transition-colors hover:text-brand"
        >
          Forgot password?
        </Link>
        <Link
          href="/register"
          className="transition-colors hover:text-brand"
        >
          Create an account
        </Link>
      </div>
    </div>
  );
}
