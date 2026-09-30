"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";

// Bumped from "purepep-research-attest" when the gate became a full terms
// acceptance: anyone who clicked through the old one-button version is asked
// once more. Bump again whenever the summary below materially changes.
const STORAGE_KEY = "purepep-terms-accept-v1";

/** Pages a visitor must be able to read before agreeing to them. */
const LEGAL_PATHS = ["/terms", "/research-use", "/privacy", "/export-compliance"];
/** Attestation is considered valid for 90 days from the stored date. */
const ATTEST_TTL_DAYS = 90;

function readAttest(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const when = new Date(raw);
    if (Number.isNaN(when.getTime())) return false;
    const ageMs = Date.now() - when.getTime();
    const ttlMs = ATTEST_TTL_DAYS * 24 * 60 * 60 * 1000;
    return ageMs <= ttlMs;
  } catch {
    return false;
  }
}

export default function AgeGate() {
  // Start with null (unknown) → render nothing on SSR and first client paint,
  // then resolve after reading localStorage to avoid hydration mismatch.
  const [open, setOpen] = useState<boolean | null>(null);
  const [agreed, setAgreed] = useState(false);
  const pathname = usePathname();
  const panelRef = useRef<HTMLDivElement | null>(null);
  const agreeRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setOpen(!readAttest());
  }, []);

  // Focus into the modal when it opens; lock body scroll.
  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    agreeRef.current?.focus();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
      previouslyFocused?.focus?.();
    };
  }, [open]);

  const handleAttest = useCallback(() => {
    if (!agreed) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, new Date().toISOString());
    } catch {
      // Storage may be disabled; dismiss anyway for this session.
    }
    setOpen(false);
  }, [agreed]);

  const handleLeave = useCallback(() => {
    window.location.replace("https://www.nih.gov/");
  }, []);

  // Focus trap: cycle Tab within the panel. Escape is swallowed.
  const onKeyDown = useCallback((e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    if (e.key !== "Tab" || !panelRef.current) return;
    const focusable = panelRef.current.querySelectorAll<HTMLElement>(
      'button, [href], input, [tabindex]:not([tabindex="-1"])',
    );
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement as HTMLElement | null;
    if (e.shiftKey) {
      if (active === first || !panelRef.current.contains(active)) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (active === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }, []);

  // The full terms stay readable without agreeing to them first.
  const onLegalPage = LEGAL_PATHS.some((p) => pathname?.startsWith(p));
  if (!open || onLegalPage) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-background/95 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="age-gate-title"
      aria-describedby="age-gate-body"
      onKeyDown={onKeyDown}
      onClick={(e) => {
        // Backdrop click does NOT dismiss; swallow it.
        if (e.target === e.currentTarget) e.stopPropagation();
      }}
    >
      {/* Subtle brand glow so the panel doesn't feel flat */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.18] blur-3xl"
        style={{
          background:
            "radial-gradient(ellipse at 20% 30%, var(--brand-deep), transparent 60%), radial-gradient(ellipse at 80% 70%, var(--brand), transparent 55%)",
        }}
      />

      <div
        ref={panelRef}
        className="relative mx-4 flex max-h-[calc(100dvh-2rem)] w-full max-w-[min(36rem,calc(100%-2rem))] flex-col border border-hairline bg-surface shadow-[0_0_0_1px_rgba(255,255,255,0.02),0_40px_80px_-20px_rgba(0,0,0,0.6)]"
      >
        {/* Corner ticks — reuse the cinematic motif */}
        <CornerTicks />

        <div
          className="relative flex min-h-0 flex-1 flex-col"
          style={{
            paddingInline: "clamp(1.25rem, 3vw, 2.5rem)",
            paddingTop: "clamp(1.5rem, 3vw, 2.5rem)",
            paddingBottom: "clamp(1.25rem, 2.5vw, 2rem)",
          }}
        >
          <div
            className="flex items-center font-mono tracking-[0.3em] uppercase text-muted-foreground"
            style={{
              fontSize: "clamp(9.5px, 0.25vw + 8.5px, 10.5px)",
              gap: "clamp(0.5rem, 1.2vw, 1rem)",
            }}
          >
            <span className="whitespace-nowrap text-brand">§ 00</span>
            <span
              className="h-px shrink-0 bg-hairline"
              style={{ width: "clamp(1rem, 2.5vw, 2rem)" }}
            />
            <span>Terms &amp; conditions</span>
          </div>

          <h2
            id="age-gate-title"
            className="font-display leading-[0.95] tracking-[-0.02em] text-foreground"
            style={{
              marginTop: "clamp(0.85rem, 1.5vw, 1.25rem)",
              fontSize: "clamp(1.875rem, 3.5vw, 2.75rem)",
            }}
          >
            For{" "}
            <span className="italic text-gradient-brand">research</span> use
            only.
          </h2>

          <p
            className="mt-4 font-sans leading-relaxed text-muted-foreground"
            style={{ fontSize: "clamp(0.85rem, 0.3vw + 0.8rem, 0.95rem)" }}
          >
            By entering this site or buying from us, you agree to the terms
            below. If you do not agree, please leave.
          </p>

          <div
            id="age-gate-body"
            tabIndex={0}
            aria-label="Terms and conditions summary"
            className="mt-4 min-h-[9rem] flex-1 overflow-y-auto overscroll-contain border border-hairline bg-background/60 font-sans leading-relaxed text-muted-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand"
            style={{
              padding: "clamp(0.9rem, 2vw, 1.25rem)",
              fontSize: "clamp(0.8rem, 0.25vw + 0.76rem, 0.9rem)",
            }}
          >
            {TERMS.map((t) => (
              <section key={t.title} className="mb-4 last:mb-0">
                <h3 className="font-mono tracking-[0.18em] uppercase text-foreground" style={{ fontSize: "clamp(9.5px, 0.25vw + 8.5px, 10.5px)" }}>
                  {t.title}
                </h3>
                <p className="mt-1.5">{t.body}</p>
              </section>
            ))}
            <p className="mt-4 border-t border-hairline pt-3">
              This is a summary. The full{" "}
              <Link href="/terms" target="_blank" className="text-brand underline-offset-2 hover:underline">
                Terms of Sale
              </Link>{" "}
              and{" "}
              <Link href="/research-use" target="_blank" className="text-brand underline-offset-2 hover:underline">
                Research Use Policy
              </Link>{" "}
              govern every order.
            </p>
          </div>

          <label
            className="mt-4 flex cursor-pointer items-start gap-3 font-sans text-foreground"
            style={{ fontSize: "clamp(0.85rem, 0.3vw + 0.8rem, 0.95rem)" }}
          >
            <input
              ref={agreeRef}
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 size-5 shrink-0 cursor-pointer accent-[var(--brand)]"
            />
            <span>
              I am 21 or older, and I have read, understood and agree to the
              Terms &amp; Conditions.
            </span>
          </label>

          <div
            className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-stretch"
            style={{ gap: "clamp(0.5rem, 1vw, 0.75rem)" }}
          >
            <button
              type="button"
              onClick={handleAttest}
              disabled={!agreed}
              className="group inline-flex flex-1 items-center justify-center gap-3 whitespace-nowrap bg-brand disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:shadow-none font-mono tracking-[0.3em] uppercase text-brand-foreground transition-all hover:shadow-[0_0_0_4px_oklch(0.82_0.15_210_/_0.18)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              style={{
                paddingInline: "clamp(1rem, 1.5vw, 1.4rem)",
                paddingBlock: "clamp(0.75rem, 1vw, 0.95rem)",
                fontSize: "clamp(10px, 0.3vw + 9px, 11px)",
              }}
            >
              I understand — enter site
              <span className="transition-transform group-hover:translate-x-1" aria-hidden>
                →
              </span>
            </button>
            <button
              type="button"
              onClick={handleLeave}
              className="inline-flex items-center justify-center whitespace-nowrap border border-hairline font-mono tracking-[0.3em] uppercase text-foreground transition-colors hover:border-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              style={{
                paddingInline: "clamp(1rem, 1.5vw, 1.4rem)",
                paddingBlock: "clamp(0.75rem, 1vw, 0.95rem)",
                fontSize: "clamp(10px, 0.3vw + 9px, 11px)",
              }}
            >
              Leave
            </button>
          </div>

          <p
            className="mt-4 font-mono tracking-[0.2em] uppercase text-muted-foreground/80"
            style={{ fontSize: "clamp(9px, 0.25vw + 8px, 10px)" }}
          >
            Remembered on this device for 90 days.
          </p>
        </div>
      </div>
    </div>
  );
}

const TERMS: { title: string; body: string }[] = [
  {
    title: "1 · Eligibility",
    body: "You must be at least 21 years old and a qualified researcher, clinician or educator to buy from The Pure Pep. The information you give us must be accurate. We may decline or cancel any order where eligibility cannot be confirmed.",
  },
  {
    title: "2 · Research use only",
    body: "Every product is sold strictly for laboratory research. Products are not for human or animal use of any kind. They are not drugs, foods, dietary supplements or cosmetics, have not been evaluated by the FDA, and are not intended to diagnose, treat, cure or prevent any disease.",
  },
  {
    title: "3 · Prohibited uses",
    body: "You may not administer any product to a person — including yourself — or to an animal outside an approved research protocol. You may not resell, relabel or repackage products, or re-export them without our written consent.",
  },
  {
    title: "4 · Handling and compliance",
    body: "Products must be stored and handled in a laboratory setting by qualified personnel. You are responsible for following every law and regulation that applies to you.",
  },
  {
    title: "5 · No medical advice",
    body: "Nothing on this site is medical advice or a recommendation to use any product.",
  },
  {
    title: "6 · Orders",
    body: "Prices are in U.S. dollars. Research compounds are final sale. These terms are governed by the laws of the State of Texas.",
  },
  {
    title: "7 · Breach",
    body: "If these terms are broken we may cancel open orders and close the account concerned.",
  },
];

function CornerTicks() {
  const corners = [
    "top-2 left-2 border-t border-l",
    "top-2 right-2 border-t border-r",
    "bottom-2 left-2 border-b border-l",
    "bottom-2 right-2 border-b border-r",
  ];
  return (
    <>
      {corners.map((c) => (
        <div
          key={c}
          aria-hidden
          className={`pointer-events-none absolute size-[clamp(0.85rem,1.3vw,1.25rem)] border-foreground/40 ${c}`}
        />
      ))}
    </>
  );
}
