"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart/store";

/**
 * Small cart icon button with a count badge. Placeholder is rendered on
 * the server and on the first client render so React hydration stays
 * aligned; the badge only appears after `useCart()` reports `hydrated`.
 */
export function CartTrigger() {
  const { count, hydrated } = useCart();
  const showBadge = hydrated && count > 0;

  return (
    <Link
      href="/cart"
      aria-label={
        hydrated && count > 0
          ? `Cart — ${count} item${count === 1 ? "" : "s"}`
          : "Cart"
      }
      className="relative inline-flex size-9 items-center justify-center border border-hairline text-foreground transition-colors hover:border-foreground"
    >
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        className="size-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="square"
      >
        <path d="M3 5h3l2.2 10.4a1.5 1.5 0 0 0 1.5 1.2h7.3a1.5 1.5 0 0 0 1.5-1.15L20.5 8H7" />
        <circle cx="10" cy="20" r="1.1" />
        <circle cx="17" cy="20" r="1.1" />
      </svg>
      {showBadge ? (
        <span
          aria-hidden
          className="absolute -top-1.5 -right-1.5 inline-flex min-w-4 items-center justify-center rounded-full bg-brand px-1 font-mono text-[9px] leading-none tracking-[0.05em] text-brand-foreground"
          style={{ height: "1rem" }}
        >
          {count > 99 ? "99+" : count}
        </span>
      ) : null}
    </Link>
  );
}
