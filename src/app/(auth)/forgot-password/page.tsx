import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ForgotPasswordForm } from "@/components/shared/forgot-password-form";

export const metadata: Metadata = {
  title: "Reset your password — PurePep Labs",
  description: "Request a password reset link for your PurePep Labs account.",
};

export default function ForgotPasswordPage() {
  return (
    <div className="flex flex-col">
      <div className="section-eyebrow">
        <span className="whitespace-nowrap text-brand">§ 09</span>
        <span className="h-px shrink-0 bg-hairline w-[clamp(1.5rem,3vw,2.75rem)]" />
        <span>Recover access</span>
      </div>

      <h1
        className="font-display leading-[0.95] tracking-[-0.02em]"
        style={{
          marginTop: "clamp(1rem, 1.5vw, 1.5rem)",
          fontSize: "clamp(1.875rem, 5vw, 3.5rem)",
        }}
      >
        Reset your{" "}
        <span className="italic text-gradient-brand">password.</span>
      </h1>

      <p
        className="max-w-md font-sans leading-relaxed text-muted-foreground"
        style={{
          marginTop: "clamp(0.75rem, 1.2vw, 1.25rem)",
          fontSize: "clamp(0.85rem, 0.3vw + 0.77rem, 0.95rem)",
        }}
      >
        Enter the email tied to your account and we&rsquo;ll send a single-use
        link to set a new password. The link expires in one hour.
      </p>

      <div style={{ marginTop: "clamp(1.5rem, 3vw, 2.5rem)" }}>
        <Suspense fallback={null}>
          <ForgotPasswordForm />
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
        <Link href="/login" className="transition-colors hover:text-brand">
          ← Back to sign in
        </Link>
        <Link href="/register" className="transition-colors hover:text-brand">
          Create an account
        </Link>
      </div>
    </div>
  );
}
