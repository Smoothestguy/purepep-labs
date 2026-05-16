import Link from "next/link";
import Image from "next/image";

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
            className="group flex items-center transition-opacity hover:opacity-80"
            aria-label="PurePep Labs — home"
          >
            <Image
              src="/images/PurePep_Label.png"
              alt="PurePep Labs"
              width={1320}
              height={1348}
              priority
              className="h-[clamp(3rem,5vw,4.5rem)] w-auto"
            />
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
