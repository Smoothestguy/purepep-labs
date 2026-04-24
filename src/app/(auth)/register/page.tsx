import type { Metadata } from "next";
import Link from "next/link";
import { RegisterForm } from "@/components/shared/register-form";

export const metadata: Metadata = {
  title: "Create account — PurePep Labs",
  description:
    "Open a research-use account for access to the PurePep Labs catalog.",
};

export default function RegisterPage() {
  return (
    <div className="flex flex-col">
      <div className="section-eyebrow">
        <span className="whitespace-nowrap text-brand">§ 07</span>
        <span className="h-px shrink-0 bg-hairline w-[clamp(1.5rem,3vw,2.75rem)]" />
        <span>Enrolment</span>
      </div>

      <h1
        className="font-display leading-[0.95] tracking-[-0.02em]"
        style={{
          marginTop: "clamp(1rem, 1.5vw, 1.5rem)",
          fontSize: "clamp(1.875rem, 5vw, 3.5rem)",
        }}
      >
        Open an{" "}
        <span className="italic text-gradient-brand">account.</span>
      </h1>

      <p
        className="max-w-md font-sans leading-relaxed text-muted-foreground"
        style={{
          marginTop: "clamp(0.75rem, 1.2vw, 1.25rem)",
          fontSize: "clamp(0.85rem, 0.3vw + 0.77rem, 0.95rem)",
        }}
      >
        For qualified researchers only. You will receive a confirmation email
        to verify the address you register with.
      </p>

      <div style={{ marginTop: "clamp(1.5rem, 3vw, 2.5rem)" }}>
        <RegisterForm />
      </div>

      <div
        className="border-t border-hairline font-mono tracking-[0.25em] uppercase text-muted-foreground"
        style={{
          marginTop: "clamp(2rem, 4vw, 3rem)",
          paddingTop: "clamp(1.25rem, 2vw, 1.75rem)",
          fontSize: "clamp(9.5px, 0.25vw + 8.5px, 10.5px)",
        }}
      >
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-brand transition-colors hover:text-foreground"
        >
          Sign in
        </Link>
      </div>
    </div>
  );
}
