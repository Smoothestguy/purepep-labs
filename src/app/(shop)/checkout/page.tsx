import type { Metadata } from "next";
import Link from "next/link";
import { CheckoutForm } from "@/components/shop/checkout-form";
import { getCurrentUser } from "@/lib/auth/user";
import { cardProcessor, enabledMethods } from "@/lib/payments/processor";

export const metadata: Metadata = {
  title: "Checkout — The Pure Pep",
  description: "Finalise your order. Cold-chain dispatch within one business day.",
};

type SearchParams = Promise<{ cancelled?: string | string[] }>;

function first(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

/**
 * Checkout is account-only.
 *
 * The gate is enforced again inside POST /api/checkout — this check just
 * saves the customer from filling in a long form before being told to
 * sign in. Never treat a page-level check as the security boundary.
 *
 * Payment methods and the active card processor are resolved here rather
 * than in the form, because both depend on secret keys the browser must
 * never see.
 */
export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const [user, resolved] = await Promise.all([getCurrentUser(), searchParams]);
  const cancelled = first(resolved.cancelled) === "1";

  return (
    <section className="relative border-b border-hairline">
      {cancelled ? (
        <div className="border-b border-heat/40 bg-heat/10">
          <div
            className="mx-auto flex max-w-[var(--content-max)] items-center gap-3 pad-x py-3 font-mono tracking-[0.25em] uppercase text-heat"
            style={{ fontSize: "clamp(10px, 0.3vw + 9px, 11px)" }}
          >
            <span aria-hidden className="size-1.5 rounded-full bg-heat" />
            Payment cancelled — nothing was charged. Your cart is intact.
          </div>
        </div>
      ) : null}

      <div
        className="mx-auto w-full max-w-[var(--content-max)] pad-x"
        style={{
          paddingTop: "clamp(3.5rem, 7vw, 8rem)",
          paddingBottom: "clamp(2rem, 3vw, 3rem)",
        }}
      >
        <div className="section-eyebrow">
          <span className="whitespace-nowrap text-brand">§ 10</span>
          <span
            className="h-px shrink-0 bg-hairline"
            style={{ width: "clamp(1.5rem, 3vw, 2.75rem)" }}
          />
          <span>Checkout</span>
        </div>
        <h1
          className="display-lg"
          style={{ marginTop: "clamp(1rem, 1.5vw, 1.5rem)" }}
        >
          Finalise order
          <span className="italic font-light text-muted-foreground">
            {" "}
            — lodged,
          </span>{" "}
          <span className="italic text-gradient-brand">signed, shipped.</span>
        </h1>
        <p
          className="body-lede max-w-xl"
          style={{ marginTop: "clamp(1rem, 1.5vw, 1.25rem)" }}
        >
          {user
            ? "Enter shipping and payment. We dispatch cold-chain within one business day and email a signed CoA with every lot."
            : "Ordering is restricted to registered researchers. Sign in to continue to payment."}
        </p>
      </div>

      {user ? (
        <CheckoutForm methods={enabledMethods()} processor={cardProcessor()} />
      ) : (
        <SignInGate />
      )}
    </section>
  );
}

function SignInGate() {
  return (
    <div
      className="mx-auto w-full max-w-[var(--content-max)] pad-x"
      style={{ paddingBottom: "clamp(4rem, 7vw, 7rem)" }}
    >
      <div
        className="border border-hairline bg-surface/40"
        style={{ padding: "clamp(1.5rem, 3vw, 2.5rem)" }}
      >
        <div
          className="font-mono tracking-[0.3em] uppercase text-brand"
          style={{ fontSize: "clamp(10px, 0.3vw + 9px, 11px)" }}
        >
          Researcher account required
        </div>
        <p
          className="max-w-xl font-sans leading-relaxed text-muted-foreground"
          style={{
            marginTop: "clamp(0.85rem, 1.4vw, 1.1rem)",
            fontSize: "clamp(0.9rem, 0.3vw + 0.85rem, 1rem)",
          }}
        >
          Every order is tied to a verified account so lots stay traceable to
          the laboratory that received them. Your cart is saved — sign in and
          you&rsquo;ll come straight back here.
        </p>

        <div
          className="flex flex-col sm:flex-row sm:items-center"
          style={{
            marginTop: "clamp(1.5rem, 2.5vw, 2rem)",
            gap: "clamp(0.65rem, 1.2vw, 1rem)",
          }}
        >
          <Link
            href={`/login?redirect=${encodeURIComponent("/checkout")}`}
            className="group inline-flex items-center justify-between gap-3 bg-brand font-mono tracking-[0.3em] uppercase text-brand-foreground transition-all hover:shadow-[0_0_0_4px_oklch(0.82_0.15_210_/_0.18)]"
            style={{
              paddingInline: "clamp(1.1rem, 1.8vw, 1.6rem)",
              paddingBlock: "clamp(0.85rem, 1.1vw, 1.1rem)",
              fontSize: "clamp(10px, 0.3vw + 9px, 11px)",
            }}
          >
            <span>Sign in</span>
            <span className="transition-transform group-hover:translate-x-1">
              →
            </span>
          </Link>
          <Link
            href={`/register?redirect=${encodeURIComponent("/checkout")}`}
            className="inline-flex items-center justify-center gap-3 border border-hairline font-mono tracking-[0.3em] uppercase text-foreground transition-colors hover:border-foreground"
            style={{
              paddingInline: "clamp(1.1rem, 1.8vw, 1.6rem)",
              paddingBlock: "clamp(0.85rem, 1.1vw, 1.1rem)",
              fontSize: "clamp(10px, 0.3vw + 9px, 11px)",
            }}
          >
            Create account
          </Link>
        </div>
      </div>
    </div>
  );
}
