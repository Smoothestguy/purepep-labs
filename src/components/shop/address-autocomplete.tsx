"use client";

import { useEffect, useId, useRef, useState } from "react";

export type ResolvedAddress = {
  address1: string;
  city: string;
  state: string;
  zip: string;
};

type Props = {
  value: string;
  /** Fires on every keystroke — the customer can always type freely. */
  onChange: (value: string) => void;
  /** Fires when a suggestion is chosen and resolved into components. */
  onResolved: (address: ResolvedAddress) => void;
  label?: string;
  required?: boolean;
};

/** Long enough to stop firing a paid lookup on every single keystroke. */
const DEBOUNCE_MS = 300;

type Suggestion = { placeId: string; main: string; secondary: string };

/**
 * Address field with Google Places suggestions.
 *
 * Deliberately a plain text input with a dropdown attached, not a widget
 * that takes over the field: the customer can always ignore the list and
 * type an address by hand. Rural and new-build addresses regularly fail
 * to autocomplete, and a field that only accepts a suggestion loses those
 * orders outright.
 *
 * Everything here degrades to an ordinary input. If Places is
 * unconfigured or the request fails, the endpoint returns an empty list
 * and no dropdown appears.
 *
 * The session token is what keeps this affordable — Places bills a whole
 * type-then-pick sequence as one session when the calls share a token. A
 * fresh token is minted after each resolve, which is what ends the
 * session.
 */
export function AddressAutocomplete({
  value,
  onChange,
  onResolved,
  label = "Address",
  required,
}: Props) {
  const id = useId();
  const listboxId = `${id}-listbox`;

  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);

  const sessionToken = useRef<string>("");
  // Set when the customer picks a suggestion, so the resulting programmatic
  // value change doesn't immediately trigger a fresh lookup.
  const skipNextLookup = useRef(false);
  const boxRef = useRef<HTMLDivElement>(null);

  function newSession() {
    sessionToken.current =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : String(Math.random()).slice(2);
  }

  useEffect(() => {
    newSession();
  }, []);

  // Debounced lookup.
  useEffect(() => {
    if (skipNextLookup.current) {
      skipNextLookup.current = false;
      return;
    }
    const query = value.trim();
    let cancelled = false;

    // The too-short case is handled inside the timer rather than here.
    // Clearing state straight from an effect body is a synchronous
    // setState that cascades an extra render on every keystroke.
    const timer = setTimeout(() => {
      if (query.length < 3) {
        setSuggestions([]);
        setOpen(false);
        setActive(-1);
        return;
      }
      void (async () => {
        try {
          const res = await fetch("/api/address/suggest", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              input: query,
              sessionToken: sessionToken.current,
            }),
          });
          const data = (await res.json()) as { suggestions?: Suggestion[] };
          if (cancelled) return;
          const next = data.suggestions ?? [];
          setSuggestions(next);
          setOpen(next.length > 0);
          setActive(-1);
        } catch {
          if (!cancelled) {
            setSuggestions([]);
            setOpen(false);
          }
        }
      })();
    }, DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [value]);

  // Close when focus or a click lands outside.
  useEffect(() => {
    function onDocPointerDown(e: MouseEvent | TouchEvent) {
      if (!boxRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocPointerDown);
    document.addEventListener("touchstart", onDocPointerDown);
    return () => {
      document.removeEventListener("mousedown", onDocPointerDown);
      document.removeEventListener("touchstart", onDocPointerDown);
    };
  }, []);

  async function choose(s: Suggestion) {
    // Fill the street line immediately; the rest follows once resolved.
    skipNextLookup.current = true;
    onChange(s.main);
    setOpen(false);
    setSuggestions([]);
    setActive(-1);

    try {
      const res = await fetch("/api/address/resolve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          placeId: s.placeId,
          sessionToken: sessionToken.current,
        }),
      });
      const data = (await res.json()) as { address?: ResolvedAddress | null };
      if (data.address?.address1) onResolved(data.address);
    } catch {
      // Street line is already in; the customer completes the rest.
    } finally {
      // That request closed the billing session either way.
      newSession();
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open || suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (i + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
    } else if (e.key === "Enter") {
      // Only intercept Enter when a suggestion is highlighted, so the key
      // still submits the form normally otherwise.
      if (active >= 0) {
        e.preventDefault();
        void choose(suggestions[active]);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div ref={boxRef} className="relative">
      <label htmlFor={id} className="flex flex-col gap-1.5">
        <span
          className="font-mono tracking-[0.22em] uppercase text-muted-foreground"
          style={{ fontSize: "clamp(9.5px, 0.25vw + 8.5px, 10.5px)" }}
        >
          {label}
          {required ? (
            <span aria-hidden className="ml-1 text-brand">
              *
            </span>
          ) : null}
        </span>
        <input
          id={id}
          name="address1"
          type="text"
          // "off" rather than address-line1: the browser's own dropdown
          // would otherwise cover this one.
          autoComplete="off"
          required={required}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          onFocus={() => setOpen(suggestions.length > 0)}
          role="combobox"
          aria-expanded={open}
          aria-controls={listboxId}
          aria-autocomplete="list"
          aria-activedescendant={
            active >= 0 ? `${id}-opt-${active}` : undefined
          }
          className="w-full border border-hairline bg-transparent font-mono tracking-[0.05em] text-foreground placeholder:text-muted-foreground/60 transition-colors focus:border-brand focus:outline-none"
          style={{
            paddingInline: "clamp(0.75rem, 1.1vw, 1rem)",
            paddingBlock: "clamp(0.7rem, 0.95vw, 0.9rem)",
            fontSize: "clamp(11px, 0.25vw + 10px, 12.5px)",
            minHeight: "2.5rem",
          }}
        />
      </label>

      {open && suggestions.length > 0 ? (
        <ul
          id={listboxId}
          role="listbox"
          className="absolute left-0 right-0 z-20 mt-1 max-h-72 overflow-y-auto border border-hairline bg-background shadow-[0_12px_40px_oklch(0_0_0_/_0.55)]"
        >
          {suggestions.map((s, i) => (
            <li key={s.placeId} role="presentation">
              <button
                id={`${id}-opt-${i}`}
                type="button"
                role="option"
                aria-selected={i === active}
                // mousedown, not click: the input's blur would close the
                // list before a click ever landed.
                onMouseDown={(e) => {
                  e.preventDefault();
                  void choose(s);
                }}
                onMouseEnter={() => setActive(i)}
                className={`flex w-full flex-col items-start gap-0.5 border-b border-hairline text-left transition-colors last:border-b-0 ${
                  i === active ? "bg-surface" : "bg-transparent"
                }`}
                style={{
                  paddingInline: "clamp(0.75rem, 1.1vw, 1rem)",
                  paddingBlock: "clamp(0.6rem, 0.9vw, 0.8rem)",
                }}
              >
                <span
                  className="font-mono tracking-[0.05em] text-foreground"
                  style={{ fontSize: "clamp(11px, 0.25vw + 10px, 12.5px)" }}
                >
                  {s.main}
                </span>
                {s.secondary ? (
                  <span
                    className="font-mono tracking-[0.05em] text-muted-foreground"
                    style={{ fontSize: "clamp(10px, 0.22vw + 9px, 11px)" }}
                  >
                    {s.secondary}
                  </span>
                ) : null}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
