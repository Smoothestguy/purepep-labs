"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CartTrigger } from "@/components/shop/cart-trigger";
import { AuthButton } from "@/components/shared/auth-button";

const nav = [
  { href: "/shop", label: "Catalog" },
  { href: "/#science", label: "Science" },
  { href: "/coa", label: "Documentation" },
];

export function SiteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-hairline bg-background/70 backdrop-blur-md">
      <div className="mx-auto flex h-[clamp(5rem,7vw+2rem,7rem)] w-full max-w-[var(--content-max)] items-center justify-between gap-4 pad-x">
        <Link href="/" className="group flex items-center" aria-label="PurePep Labs — home">
          <Image
            src="/images/PurePep_Label.png"
            alt="PurePep Labs"
            width={1320}
            height={1348}
            priority
            className="h-[clamp(3.75rem,6vw,5.5rem)] w-auto"
          />
        </Link>

        <nav className="hidden items-center gap-[clamp(1.25rem,2.4vw,2.5rem)] md:flex">
          {nav.map((item, i) => (
            <Link
              key={item.href}
              href={item.href}
              className="group relative flex items-center gap-2 font-mono text-[clamp(10px,0.8vw+4px,11px)] tracking-[0.22em] uppercase text-muted-foreground transition-colors hover:text-foreground"
            >
              <span className="text-brand">
                {String(i + 1).padStart(2, "0")}
              </span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-[clamp(0.5rem,1vw,0.75rem)]">
          <AuthButton />
          <CartTrigger />
          <Link
            href="/shop"
            className="group relative inline-flex items-center gap-2 whitespace-nowrap border border-foreground bg-foreground px-[clamp(0.9rem,1.5vw,1.25rem)] py-[clamp(0.45rem,0.7vw,0.65rem)] font-mono text-[clamp(10px,0.8vw+4px,11px)] tracking-[0.22em] uppercase text-background transition-colors hover:border-brand hover:bg-brand hover:text-brand-foreground"
          >
            <span className="hidden sm:inline">Shop catalog</span>
            <span className="sm:hidden">Shop</span>
            <span aria-hidden>→</span>
          </Link>

          {/* Mobile hamburger — <md only */}
          <Dialog open={mobileOpen} onOpenChange={setMobileOpen}>
            <DialogTrigger asChild>
              <button
                type="button"
                aria-label="Open menu"
                className="relative inline-flex size-9 items-center justify-center border border-hairline text-foreground transition-colors hover:border-foreground md:hidden"
              >
                <span aria-hidden className="flex flex-col gap-[3px]">
                  <span className="block h-px w-4 bg-current" />
                  <span className="block h-px w-4 bg-current" />
                  <span className="block h-px w-4 bg-current" />
                </span>
              </button>
            </DialogTrigger>
            <DialogContent
              showCloseButton={false}
              className="fixed inset-0 left-0 top-0 z-50 grid h-[100dvh] w-full max-w-none translate-x-0 translate-y-0 grid-rows-[auto_1fr_auto] gap-0 rounded-none border-l border-hairline bg-background p-0 text-foreground ring-0 sm:max-w-none md:hidden"
            >
              <DialogTitle className="sr-only">Menu</DialogTitle>

              <div className="flex items-center justify-between border-b border-hairline pad-x py-4">
                <span className="font-mono text-[11px] tracking-[0.3em] uppercase text-muted-foreground">
                  Menu
                </span>
                <button
                  type="button"
                  aria-label="Close menu"
                  onClick={() => setMobileOpen(false)}
                  className="font-mono text-[11px] tracking-[0.3em] uppercase text-muted-foreground transition-colors hover:text-foreground"
                >
                  Close ✕
                </button>
              </div>

              <nav className="flex flex-col gap-6 pad-x py-10">
                {nav.map((item, i) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="group flex items-baseline gap-5 font-display tracking-tight text-foreground transition-colors hover:text-brand"
                    style={{ fontSize: "clamp(2rem, 8vw, 3rem)" }}
                  >
                    <span
                      className="font-mono tracking-[0.3em] uppercase text-brand"
                      style={{ fontSize: "clamp(10px, 0.8vw + 4px, 11px)" }}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span>{item.label}</span>
                  </Link>
                ))}
              </nav>

              <div className="flex flex-col gap-3 border-t border-hairline pad-x py-6">
                <Link
                  href="/cart"
                  onClick={() => setMobileOpen(false)}
                  className="inline-flex items-center justify-center gap-3 border border-hairline py-4 font-mono text-[11px] tracking-[0.3em] uppercase text-foreground transition-colors hover:border-foreground"
                >
                  View cart
                  <span aria-hidden>→</span>
                </Link>
                <AuthButton
                  variant="mobile"
                  onNavigate={() => setMobileOpen(false)}
                />
                <Link
                  href="/shop"
                  onClick={() => setMobileOpen(false)}
                  className="inline-flex items-center justify-center gap-3 bg-brand py-4 font-mono text-[11px] tracking-[0.3em] uppercase text-brand-foreground transition-colors hover:bg-foreground hover:text-background"
                >
                  Shop catalog
                  <span aria-hidden>→</span>
                </Link>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </header>
  );
}
