"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";

const STORAGE_KEY = "purepep-research-attest";
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
  const panelRef = useRef<HTMLDivElement | null>(null);
  const attestBtnRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    setOpen(!readAttest());
  }, []);

  // Focus into the modal when it opens; lock body scroll.
  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    attestBtnRef.current?.focus();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
      previouslyFocused?.focus?.();
    };
  }, [open]);

  const handleAttest = useCallback(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, new Date().toISOString());
    } catch {
      // Storage may be disabled; dismiss anyway for this session.
    }
    setOpen(false);
  }, []);

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

  if (!open) return null;

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
        className="relative mx-4 w-full max-w-[min(32rem,calc(100%-2rem))] border border-hairline bg-surface shadow-[0_0_0_1px_rgba(255,255,255,0.02),0_40px_80px_-20px_rgba(0,0,0,0.6)]"
      >
        {/* Corner ticks — reuse the cinematic motif */}
        <CornerTicks />

        <div
          className="relative flex flex-col"
          style={{
            paddingInline: "clamp(1.5rem, 3vw, 2.5rem)",
            paddingTop: "clamp(1.75rem, 3vw, 2.5rem)",
            paddingBottom: "clamp(1.5rem, 2.5vw, 2rem)",
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
            <span>Attestation</span>
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
            id="age-gate-body"
            className="mt-5 font-sans leading-relaxed text-muted-foreground"
            style={{ fontSize: "clamp(0.9rem, 0.35vw + 0.82rem, 1rem)" }}
          >
            This site sells compounds for laboratory research use only. By
            entering, you attest that you are twenty-one or older, a qualified
            researcher or clinician, and that you will not administer these
            compounds to humans or animals.
          </p>

          <div
            className="mt-7 flex flex-col gap-2 sm:flex-row sm:items-stretch"
            style={{ gap: "clamp(0.5rem, 1vw, 0.75rem)" }}
          >
            <button
              ref={attestBtnRef}
              type="button"
              onClick={handleAttest}
              className="group inline-flex items-center justify-center gap-3 whitespace-nowrap bg-brand font-mono tracking-[0.3em] uppercase text-brand-foreground transition-all hover:shadow-[0_0_0_4px_oklch(0.82_0.15_210_/_0.18)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              style={{
                paddingInline: "clamp(1rem, 1.5vw, 1.4rem)",
                paddingBlock: "clamp(0.75rem, 1vw, 0.95rem)",
                fontSize: "clamp(10px, 0.3vw + 9px, 11px)",
              }}
            >
              I attest — enter
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
            className="mt-6 border-t border-hairline pt-4 font-mono tracking-[0.2em] uppercase text-muted-foreground/80"
            style={{ fontSize: "clamp(9px, 0.25vw + 8px, 10px)" }}
          >
            Decisions are logged locally on this device for 90 days.
          </p>
        </div>
      </div>
    </div>
  );
}

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
