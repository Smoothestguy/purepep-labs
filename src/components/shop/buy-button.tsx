"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { useCartStore } from "@/lib/cart/store";
import { useSignedIn } from "@/components/shared/auth-provider";
import type { Compound, Variant } from "@/lib/compounds";

type Props = {
  compound: Compound;
  variant: Variant;
};

/**
 * Shared styling for all three states, so the panel doesn't shift as the
 * session resolves and the button swaps for a link.
 */
const SHELL =
  "group inline-flex w-full items-center justify-between gap-3 font-mono tracking-[0.3em] uppercase transition-all";

const SHELL_STYLE = {
  paddingInline: "clamp(1.1rem, 1.8vw, 1.6rem)",
  paddingBlock: "clamp(0.85rem, 1.1vw, 1.1rem)",
  fontSize: "clamp(10px, 0.3vw + 9px, 11px)",
} as const;

/**
 * Add-to-cart, gated on being signed in.
 *
 * Signed-out visitors get a sign-in link that returns them to this exact
 * product page rather than a disabled button — they can still read the
 * monograph, they just can't buy yet. The real enforcement is server-side
 * in POST /api/checkout; this only decides what's drawn.
 */
export function BuyButton({ compound, variant }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const { signedIn, loading } = useSignedIn();
  const addItem = useCartStore((s) => s.addItem);

  if (loading) {
    return (
      <button
        type="button"
        disabled
        aria-hidden
        className={`${SHELL} bg-surface text-muted-foreground/50`}
        style={SHELL_STYLE}
      >
        <span>·····</span>
      </button>
    );
  }

  if (!signedIn) {
    return (
      <Link
        href={`/login?redirect=${encodeURIComponent(pathname)}`}
        className={`${SHELL} border border-hairline text-foreground hover:border-foreground`}
        style={SHELL_STYLE}
      >
        <span>Sign in to order</span>
        <span className="transition-transform group-hover:translate-x-1">→</span>
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={() => {
        addItem(compound, variant);
        toast.success("Added to cart", {
          description: `${compound.name} · ${variant.dose} · $${variant.price}`,
          action: {
            label: "View cart",
            onClick: () => router.push("/cart"),
          },
        });
      }}
      className={`${SHELL} bg-brand text-brand-foreground hover:shadow-[0_0_0_4px_oklch(0.82_0.15_210_/_0.18)]`}
      style={SHELL_STYLE}
    >
      <span>Add to cart</span>
      <span className="transition-transform group-hover:translate-x-1">→</span>
    </button>
  );
}
