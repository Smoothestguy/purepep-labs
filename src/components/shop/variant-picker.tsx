"use client";

import { usePathname, useRouter } from "next/navigation";
import type { Compound } from "@/lib/compounds";
import { useSelectedVariant } from "./use-selected-variant";

type Props = {
  compound: Compound;
};

export function VariantPicker({ compound: c }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const selected = useSelectedVariant(c);

  if (c.variants.length <= 1) return null;

  return (
    <div>
      <div
        className="font-mono tracking-[0.25em] uppercase text-muted-foreground"
        style={{ fontSize: "clamp(9.5px, 0.25vw + 8.5px, 10.5px)" }}
      >
        Dose
      </div>
      <div
        className="flex flex-wrap"
        style={{ marginTop: "clamp(0.5rem, 0.9vw, 0.7rem)", gap: "0.4rem" }}
        role="radiogroup"
        aria-label="Select dose"
      >
        {c.variants.map((v) => {
          const active = v.dose === selected.dose;
          return (
            <button
              key={v.dose}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => {
                router.replace(`${pathname}?dose=${encodeURIComponent(v.dose)}`, {
                  scroll: false,
                });
              }}
              className={`border font-mono tracking-[0.18em] uppercase transition-colors ${
                active
                  ? "border-brand bg-brand/10 text-brand"
                  : "border-hairline text-muted-foreground hover:text-foreground"
              }`}
              style={{
                fontSize: "clamp(10px, 0.25vw + 9px, 11px)",
                paddingInline: "clamp(0.65rem, 1vw, 0.85rem)",
                paddingBlock: "clamp(0.4rem, 0.6vw, 0.5rem)",
              }}
            >
              {v.dose}
            </button>
          );
        })}
      </div>
    </div>
  );
}
