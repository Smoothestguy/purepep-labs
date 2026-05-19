import type { Metadata } from "next";
import Image from "next/image";
import { joinWaitlist, unlock } from "./actions";

export const metadata: Metadata = {
  title: "PurePep Labs — Site under maintenance",
  description: "Site temporarily offline. Join the waitlist for launch.",
  robots: { index: false, follow: false },
};

type Search = {
  next?: string;
  error?: string;
  waitlist?: "ok" | "invalid" | "error";
};

export default async function PasswordPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const sp = await searchParams;
  const next = sp.next ?? "/";
  const showStaffError = sp.error === "1";
  const waitlistState = sp.waitlist;

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background text-foreground">
      {/* Brand glow — upper right */}
      <div
        aria-hidden
        className="pointer-events-none absolute"
        style={{
          top: "-25%",
          right: "-15%",
          width: "55rem",
          height: "55rem",
          borderRadius: "9999px",
          background:
            "radial-gradient(closest-side, oklch(0.82 0.15 210 / 0.22), transparent 70%)",
        }}
      />
      {/* Brand glow — lower left */}
      <div
        aria-hidden
        className="pointer-events-none absolute"
        style={{
          bottom: "-25%",
          left: "-15%",
          width: "55rem",
          height: "55rem",
          borderRadius: "9999px",
          background:
            "radial-gradient(closest-side, oklch(0.65 0.22 258 / 0.18), transparent 70%)",
        }}
      />

      {/* Hairline frame — hidden on small screens to avoid double-frame feel */}
      <div
        aria-hidden
        className="pointer-events-none absolute hidden sm:block"
        style={{
          inset: "1.5rem",
          border: "1px solid oklch(1 0 0 / 0.08)",
        }}
      />

      <div className="relative z-10 flex w-full max-w-[30rem] flex-col items-center px-5 py-10 text-center sm:px-6 sm:py-12">
        {/* PurePep label mark */}
        <Image
          src="/images/PurePep_Label.png"
          alt="PurePep Labs"
          width={1320}
          height={1348}
          priority
          className="h-24 w-auto sm:h-32"
        />

        {/* Eyebrow */}
        <div
          className="mt-4 font-mono uppercase text-muted-foreground"
          style={{
            fontSize: "11px",
            letterSpacing: "0.3em",
          }}
        >
          § 00 · Launching soon
        </div>

        {/* Headline */}
        <h1
          className="display-hero mt-4"
          style={{
            fontSize: "clamp(2rem, 4.5vw, 3.25rem)",
            lineHeight: 1.02,
            letterSpacing: "-0.02em",
          }}
        >
          We&rsquo;re working on the site.
        </h1>

        {/* Lede */}
        <p
          className="mt-4 max-w-[26rem] text-muted-foreground"
          style={{
            fontSize: "clamp(0.95rem, 1vw + 0.4rem, 1.05rem)",
            lineHeight: 1.55,
          }}
        >
          PurePep Labs is briefly offline while we finish the catalog and
          documentation system. Drop your email and we&rsquo;ll let you know
          the moment it&rsquo;s live.
        </p>

        {/* Waitlist form — primary CTA */}
        <form
          action={joinWaitlist}
          className="mt-10 flex w-full flex-col gap-3"
          autoComplete="off"
        >
          <input type="hidden" name="next" value={next} />
          <label
            htmlFor="waitlist-email"
            className="font-mono uppercase text-muted-foreground"
            style={{
              fontSize: "10px",
              letterSpacing: "0.3em",
              textAlign: "left",
            }}
          >
            Notify me at launch
          </label>
          <div className="flex w-full flex-col gap-2 sm:flex-row">
            <input
              id="waitlist-email"
              name="email"
              type="email"
              required
              placeholder="you@lab.org"
              autoFocus
              aria-invalid={waitlistState === "invalid" || undefined}
              aria-describedby={
                waitlistState ? "waitlist-status" : undefined
              }
              className="min-w-0 w-full bg-transparent px-4 py-3 font-mono text-foreground outline-none transition-colors focus:border-brand"
              style={{
                border: "1px solid oklch(1 0 0 / 0.18)",
                fontSize: "16px",
              }}
            />
            <button
              type="submit"
              className="group inline-flex w-full items-center justify-center gap-2 whitespace-nowrap px-4 py-3 font-mono text-[11px] uppercase tracking-[0.2em] transition-all hover:shadow-[0_0_0_4px_oklch(0.82_0.15_210_/_0.22)] sm:w-auto sm:px-5 sm:tracking-[0.3em]"
              style={{
                background: "oklch(0.82 0.15 210)",
                color: "oklch(0.14 0.01 250)",
              }}
            >
              Notify me
              <span className="transition-transform group-hover:translate-x-1">
                →
              </span>
            </button>
          </div>

          {waitlistState === "ok" ? (
            <div
              id="waitlist-status"
              className="font-mono uppercase text-brand"
              style={{
                fontSize: "10px",
                letterSpacing: "0.3em",
                textAlign: "left",
              }}
            >
              ✓ You&rsquo;re on the list — we&rsquo;ll be in touch.
            </div>
          ) : null}
          {waitlistState === "invalid" ? (
            <div
              id="waitlist-status"
              className="font-mono uppercase text-heat"
              style={{
                fontSize: "10px",
                letterSpacing: "0.3em",
                textAlign: "left",
              }}
            >
              Enter a valid email address.
            </div>
          ) : null}
          {waitlistState === "error" ? (
            <div
              id="waitlist-status"
              className="font-mono uppercase text-heat"
              style={{
                fontSize: "10px",
                letterSpacing: "0.3em",
                textAlign: "left",
              }}
            >
              Couldn&rsquo;t save right now — please try again shortly.
            </div>
          ) : null}
        </form>

        {/* Divider */}
        <div
          className="mt-10 w-full"
          style={{
            height: "1px",
            background:
              "linear-gradient(to right, transparent, oklch(1 0 0 / 0.14), transparent)",
          }}
        />

        {/* Staff password — secondary, collapsed by default via <details> */}
        <details className="mt-8 w-full text-left">
          <summary
            className="cursor-pointer list-none font-mono uppercase text-muted-foreground transition-colors hover:text-foreground"
            style={{
              fontSize: "10px",
              letterSpacing: "0.3em",
            }}
          >
            Staff access →
          </summary>
          <form
            action={unlock}
            className="mt-4 flex w-full flex-col gap-3"
            autoComplete="off"
          >
            <input type="hidden" name="next" value={next} />
            <label
              htmlFor="site-password"
              className="font-mono uppercase text-muted-foreground"
              style={{
                fontSize: "10px",
                letterSpacing: "0.3em",
              }}
            >
              Password
            </label>
            <input
              id="site-password"
              name="password"
              type="password"
              required
              aria-invalid={showStaffError || undefined}
              aria-describedby={showStaffError ? "site-password-error" : undefined}
              className="min-w-0 w-full bg-transparent px-4 py-3 font-mono text-foreground outline-none transition-colors focus:border-brand"
              style={{
                border: "1px solid oklch(1 0 0 / 0.18)",
                letterSpacing: "0.1em",
                fontSize: "16px",
              }}
            />
            {showStaffError ? (
              <div
                id="site-password-error"
                className="font-mono uppercase text-heat"
                style={{
                  fontSize: "10px",
                  letterSpacing: "0.3em",
                }}
              >
                Incorrect password
              </div>
            ) : null}
            <button
              type="submit"
              className="group inline-flex w-full items-center justify-center gap-2 whitespace-nowrap px-4 py-3 font-mono text-[10px] uppercase tracking-[0.2em] transition-colors sm:w-auto sm:self-start sm:px-5 sm:tracking-[0.3em]"
              style={{
                border: "1px solid oklch(1 0 0 / 0.22)",
                color: "oklch(0.97 0.005 220)",
              }}
            >
              Unlock site
              <span className="transition-transform group-hover:translate-x-1">
                →
              </span>
            </button>
          </form>
        </details>

        {/* Footer mark */}
        <div
          className="mt-12 font-mono uppercase text-muted-foreground"
          style={{
            fontSize: "10px",
            letterSpacing: "0.3em",
          }}
        >
          PurePep Labs · Houston, TX
        </div>
      </div>
    </main>
  );
}
