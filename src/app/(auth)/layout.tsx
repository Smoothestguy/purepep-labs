import Link from "next/link";
import { PurepepMark } from "@/components/marketing/logo";

/**
 * Minimal auth shell — a stripped header with only the logo mark and a
 * "Back to catalog" link, and a vertically centered content column.
 * We intentionally avoid importing <SiteHeader>: Agent A may be reshaping it.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-hairline">
        <div className="mx-auto flex w-full max-w-[var(--content-max)] items-center justify-between pad-x py-5">
          <Link
            href="/"
            className="flex items-center gap-3 transition-opacity hover:opacity-80"
          >
            <PurepepMark className="h-8 w-8" />
            <span className="font-display text-base tracking-[-0.01em]">
              PurePep Labs
            </span>
          </Link>
          <Link
            href="/"
            className="font-mono text-[11px] tracking-[0.3em] uppercase text-muted-foreground transition-colors hover:text-brand"
          >
            Back to catalog
          </Link>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center pad-x py-[clamp(3rem,6vw,6rem)]">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}
