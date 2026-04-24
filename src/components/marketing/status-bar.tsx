"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

function formatUtc(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getUTCFullYear()}.${pad(d.getUTCMonth() + 1)}.${pad(
    d.getUTCDate()
  )} · ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(
    d.getUTCSeconds()
  )} UTC`;
}

function useNowUTC() {
  // Empty string on first render for SSR parity; populated on mount.
  const [now, setNow] = useState<string>("");

  useEffect(() => {
    const reducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    // Reduced motion → update once a minute; otherwise once a second.
    const tickMs = reducedMotion ? 60_000 : 1_000;

    let id: ReturnType<typeof setInterval> | null = null;

    const start = () => {
      setNow(formatUtc(new Date()));
      if (id !== null) return;
      id = setInterval(() => setNow(formatUtc(new Date())), tickMs);
    };

    const stop = () => {
      if (id !== null) {
        clearInterval(id);
        id = null;
      }
    };

    // Pause the ticker when the tab is backgrounded.
    const onVis = () => {
      if (document.hidden) stop();
      else start();
    };

    start();
    document.addEventListener("visibilitychange", onVis);

    return () => {
      document.removeEventListener("visibilitychange", onVis);
      stop();
    };
  }, []);

  return now;
}

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Reserve width so the cluster doesn't reflow on hydration.
    return (
      <span
        aria-hidden
        className="hidden whitespace-nowrap sm:inline"
        style={{ minWidth: "7ch" }}
      />
    );
  }

  const isDark = resolvedTheme === "dark";
  const nextLabel = isDark ? "light" : "dark";
  const glyph = isDark ? "◐" : "◑";
  const text = isDark ? "LIGHT" : "DARK";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={`Switch to ${nextLabel} mode`}
      className="hidden whitespace-nowrap font-mono tracking-[0.22em] uppercase text-muted-foreground transition-colors hover:text-foreground sm:inline-flex items-center gap-1.5"
    >
      <span aria-hidden>{glyph}</span>
      <span>{text}</span>
    </button>
  );
}

export function StatusBar() {
  const now = useNowUTC();
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (!mq) return;
    setReducedMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return (
    <div className="border-b border-hairline bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex w-full max-w-[var(--content-max)] items-center justify-between gap-4 py-2 pad-x font-mono text-[10px] tracking-[0.22em] uppercase text-muted-foreground [font-size:clamp(9.5px,0.9vw+4px,11px)]">
        <div className="flex min-w-0 items-center gap-[clamp(0.75rem,2vw,1.5rem)]">
          <span className="flex items-center gap-2">
            <span className="relative flex size-1.5">
              {!reducedMotion && (
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-brand opacity-70" />
              )}
              <span className="relative inline-flex size-1.5 rounded-full bg-brand" />
            </span>
            <span className="whitespace-nowrap text-foreground">Lab online</span>
          </span>
          <span className="hidden whitespace-nowrap md:inline">Houston, TX · 29.76° N</span>
          <span className="hidden whitespace-nowrap lg:inline">Temp-controlled freight</span>
        </div>
        <div className="flex min-w-0 items-center gap-[clamp(0.75rem,2vw,1.5rem)]">
          <span className="hidden whitespace-nowrap sm:inline">Batch QC · Pass</span>
          <ThemeToggle />
          <span className="min-w-[22ch] whitespace-nowrap text-right tabular-nums text-foreground">
            {now || "————.——.—— · ——:——:—— UTC"}
          </span>
        </div>
      </div>
    </div>
  );
}
