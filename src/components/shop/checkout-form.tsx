"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useCart } from "@/lib/cart/store";
import {
  loadCollectJS,
  configureCollectJS,
  startCollectJSPaymentRequest,
} from "@/lib/nmi/collect-js";
import type {
  CheckoutRequest,
  CheckoutResponse,
  CheckoutShipping,
  CollectJSTokenResponse,
} from "@/lib/nmi/types";
import { OrderSummary, SHIPPING_FLAT } from "./order-summary";

type ShippingForm = CheckoutShipping;

const EMPTY_SHIPPING: ShippingForm = {
  firstName: "",
  lastName: "",
  address1: "",
  address2: "",
  city: "",
  state: "",
  zip: "",
  phone: "",
};

/**
 * Long, single-form checkout. Three sections — contact, shipping,
 * payment — separated by hairlines. Review column (OrderSummary) is
 * sticky on lg+. Payment uses CollectJS if the public tokenization key
 * is configured, otherwise a clearly-labelled mock banner is shown and
 * the form submits with `token: "MOCK"`.
 */
export function CheckoutForm() {
  const router = useRouter();
  const { items, subtotal, clear, hydrated } = useCart();

  const hasTokenKey = Boolean(
    process.env.NEXT_PUBLIC_NMI_TOKENIZATION_KEY,
  );
  const demoMode = !hasTokenKey;

  const [email, setEmail] = useState("");
  const [shipping, setShipping] = useState<ShippingForm>(EMPTY_SHIPPING);
  const [submitting, setSubmitting] = useState(false);
  const [collectReady, setCollectReady] = useState(false);
  const [collectError, setCollectError] = useState<string | null>(null);

  const total = useMemo(
    () => (subtotal > 0 ? subtotal + SHIPPING_FLAT : 0),
    [subtotal],
  );

  // Redirect empty cart back to /cart once hydration resolves.
  useEffect(() => {
    if (hydrated && items.length === 0) {
      router.replace("/cart");
    }
  }, [hydrated, items.length, router]);

  // Load + configure CollectJS once (only when a real key is present).
  useEffect(() => {
    if (demoMode) return;

    let cancelled = false;
    loadCollectJS()
      .then(() => {
        if (cancelled) return;
        try {
          configureCollectJS({
            variant: "inline",
            paymentSelector: "#pp-place-order",
            fields: {
              ccnumber: { selector: "#ccnumber", placeholder: "Card number" },
              ccexp: { selector: "#ccexp", placeholder: "MM / YY" },
              cvv: { selector: "#cvv", placeholder: "CVV" },
            },
            callback: (response: CollectJSTokenResponse) => {
              void submitCheckout(response.token);
            },
          });
          setCollectReady(true);
        } catch (err) {
          setCollectError(
            err instanceof Error ? err.message : "CollectJS configure failed.",
          );
        }
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setCollectError(
          err instanceof Error ? err.message : "CollectJS failed to load.",
        );
      });

    return () => {
      cancelled = true;
    };
    // `submitCheckout` is defined below; stable enough to omit — the
    // callback always reads fresh state via `useCart()` inside.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [demoMode]);

  async function submitCheckout(token: string) {
    try {
      const payload: CheckoutRequest = {
        token,
        email: email.trim(),
        shipping: {
          ...shipping,
          address2: shipping.address2?.trim() || undefined,
        },
        items: items.map((i) => ({
          slug: i.slug,
          accession: i.accession,
          name: i.name,
          dose: i.dose,
          price: i.price,
          quantity: i.quantity,
        })),
        total,
      };
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as CheckoutResponse;

      if (!res.ok || !data.ok) {
        toast.error(
          ("error" in data && data.error) || "Checkout failed. Try again.",
        );
        setSubmitting(false);
        return;
      }

      clear();
      router.push(`/checkout/success?order=${encodeURIComponent(data.orderId)}`);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Network error. Try again.",
      );
      setSubmitting(false);
    }
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;
    if (items.length === 0) {
      router.replace("/cart");
      return;
    }

    setSubmitting(true);

    if (demoMode) {
      // No tokenization — simulate an approved token.
      void submitCheckout("MOCK");
      return;
    }

    if (!collectReady) {
      toast.error("Payment fields are still loading. Try again in a moment.");
      setSubmitting(false);
      return;
    }

    try {
      startCollectJSPaymentRequest();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "CollectJS is not available.",
      );
      setSubmitting(false);
    }
  }

  // Don't render the form skeleton before hydration — wait for the cart.
  if (!hydrated) {
    return (
      <div
        className="mx-auto w-full max-w-[var(--content-max)] pad-x"
        style={{ paddingBottom: "clamp(4rem, 7vw, 7rem)" }}
        aria-hidden
      >
        <div
          className="border border-hairline bg-surface/30"
          style={{ padding: "clamp(2rem, 4vw, 3rem)", minHeight: "16rem" }}
        />
      </div>
    );
  }

  return (
    <div
      className="mx-auto w-full max-w-[var(--content-max)] pad-x"
      style={{ paddingBottom: "clamp(4rem, 7vw, 7rem)" }}
    >
      <form
        onSubmit={onSubmit}
        className="grid grid-cols-1 lg:grid-cols-[1fr_22rem]"
        style={{ columnGap: "clamp(2rem, 4vw, 4rem)", rowGap: "2.5rem" }}
      >
        <div className="flex flex-col border-t border-hairline">
          {demoMode ? <DemoBanner /> : null}
          {collectError ? (
            <div
              className="border-b border-heat/40 bg-heat/10 pad-x py-3 font-mono tracking-[0.22em] uppercase text-heat"
              style={{ fontSize: "clamp(10px, 0.3vw + 9px, 11px)" }}
            >
              {collectError}
            </div>
          ) : null}

          <Section title="§ A · Contact">
            <Field
              id="email"
              label="Email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(v) => setEmail(v)}
              placeholder="researcher@lab.institute"
            />
          </Section>

          <Section title="§ B · Shipping">
            <div
              className="grid grid-cols-1 sm:grid-cols-2"
              style={{ columnGap: "clamp(0.85rem, 1.2vw, 1.1rem)", rowGap: "clamp(0.85rem, 1.2vw, 1.1rem)" }}
            >
              <Field
                id="firstName"
                label="First name"
                autoComplete="given-name"
                required
                value={shipping.firstName}
                onChange={(v) => setShipping((s) => ({ ...s, firstName: v }))}
              />
              <Field
                id="lastName"
                label="Last name"
                autoComplete="family-name"
                required
                value={shipping.lastName}
                onChange={(v) => setShipping((s) => ({ ...s, lastName: v }))}
              />
              <div className="sm:col-span-2">
                <Field
                  id="address1"
                  label="Address"
                  autoComplete="address-line1"
                  required
                  value={shipping.address1}
                  onChange={(v) => setShipping((s) => ({ ...s, address1: v }))}
                />
              </div>
              <div className="sm:col-span-2">
                <Field
                  id="address2"
                  label="Suite / Lab (optional)"
                  autoComplete="address-line2"
                  value={shipping.address2 ?? ""}
                  onChange={(v) => setShipping((s) => ({ ...s, address2: v }))}
                />
              </div>
              <Field
                id="city"
                label="City"
                autoComplete="address-level2"
                required
                value={shipping.city}
                onChange={(v) => setShipping((s) => ({ ...s, city: v }))}
              />
              <Field
                id="state"
                label="State (US)"
                autoComplete="address-level1"
                required
                maxLength={2}
                placeholder="CA"
                value={shipping.state}
                onChange={(v) =>
                  setShipping((s) => ({ ...s, state: v.toUpperCase() }))
                }
              />
              <Field
                id="zip"
                label="ZIP"
                autoComplete="postal-code"
                required
                value={shipping.zip}
                onChange={(v) => setShipping((s) => ({ ...s, zip: v }))}
              />
              <Field
                id="phone"
                label="Phone"
                type="tel"
                autoComplete="tel"
                required
                value={shipping.phone}
                onChange={(v) => setShipping((s) => ({ ...s, phone: v }))}
              />
            </div>
          </Section>

          <Section title="§ C · Payment">
            {demoMode ? (
              <p
                className="font-mono tracking-[0.05em] text-muted-foreground"
                style={{ fontSize: "clamp(11px, 0.3vw + 10px, 12px)" }}
              >
                Card fields disabled in demo mode. A mock approval will be
                issued on submit — no card data is collected or transmitted.
              </p>
            ) : (
              <div
                className="grid grid-cols-1 sm:grid-cols-[2fr_1fr_1fr]"
                style={{
                  columnGap: "clamp(0.85rem, 1.2vw, 1.1rem)",
                  rowGap: "clamp(0.85rem, 1.2vw, 1.1rem)",
                }}
              >
                <CollectField label="Card number" id="ccnumber" />
                <CollectField label="MM / YY" id="ccexp" />
                <CollectField label="CVV" id="cvv" />
              </div>
            )}
          </Section>

          {/* Review */}
          <div
            className="border-t border-hairline lg:hidden"
            style={{ paddingTop: "clamp(1.75rem, 3vw, 2.5rem)" }}
          >
            <OrderSummary subtotal={subtotal} showDisclaimer={false} />
          </div>
        </div>

        <div>
          <OrderSummary
            subtotal={subtotal}
            cta={
              <button
                id="pp-place-order"
                type="submit"
                disabled={submitting || items.length === 0}
                className="group inline-flex w-full items-center justify-between gap-3 bg-brand font-mono tracking-[0.3em] uppercase text-brand-foreground transition-all hover:shadow-[0_0_0_4px_oklch(0.82_0.15_210_/_0.18)] disabled:cursor-not-allowed disabled:opacity-60"
                style={{
                  paddingInline: "clamp(1.1rem, 1.8vw, 1.6rem)",
                  paddingBlock: "clamp(0.95rem, 1.2vw, 1.2rem)",
                  fontSize: "clamp(10px, 0.3vw + 9px, 11px)",
                }}
              >
                <span>{submitting ? "Processing…" : "Place order"}</span>
                <span className="transition-transform group-hover:translate-x-1">
                  →
                </span>
              </button>
            }
          />
        </div>
      </form>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className="border-b border-hairline"
      style={{
        paddingTop: "clamp(1.5rem, 2.5vw, 2.25rem)",
        paddingBottom: "clamp(1.5rem, 2.5vw, 2.25rem)",
      }}
    >
      <h2
        className="font-mono tracking-[0.3em] uppercase text-muted-foreground"
        style={{ fontSize: "clamp(10px, 0.3vw + 9px, 11px)" }}
      >
        {title}
      </h2>
      <div style={{ marginTop: "clamp(1rem, 1.5vw, 1.25rem)" }}>
        {children}
      </div>
    </section>
  );
}

type FieldProps = {
  id: string;
  label: string;
  type?: string;
  autoComplete?: string;
  required?: boolean;
  maxLength?: number;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
};

function Field({
  id,
  label,
  type = "text",
  autoComplete,
  required,
  maxLength,
  placeholder,
  value,
  onChange,
}: FieldProps) {
  return (
    <label htmlFor={id} className="flex flex-col gap-1.5">
      <span
        className="font-mono tracking-[0.22em] uppercase text-muted-foreground"
        style={{ fontSize: "clamp(9.5px, 0.25vw + 8.5px, 10.5px)" }}
      >
        {label}
        {required ? <span aria-hidden className="ml-1 text-brand">*</span> : null}
      </span>
      <input
        id={id}
        name={id}
        type={type}
        autoComplete={autoComplete}
        required={required}
        maxLength={maxLength}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-hairline bg-transparent font-mono tracking-[0.05em] text-foreground placeholder:text-muted-foreground/60 transition-colors focus:border-brand focus:outline-none"
        style={{
          paddingInline: "clamp(0.75rem, 1.1vw, 1rem)",
          paddingBlock: "clamp(0.7rem, 0.95vw, 0.9rem)",
          fontSize: "clamp(11px, 0.25vw + 10px, 12.5px)",
          minHeight: "2.5rem",
        }}
      />
    </label>
  );
}

/**
 * Empty container div that CollectJS mounts its secure iframe into. We
 * match the height and border of the regular text inputs so the Payment
 * section visually aligns with Contact + Shipping.
 */
function CollectField({ label, id }: { label: string; id: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span
        className="font-mono tracking-[0.22em] uppercase text-muted-foreground"
        style={{ fontSize: "clamp(9.5px, 0.25vw + 8.5px, 10.5px)" }}
      >
        {label}
      </span>
      <div
        id={id}
        className="w-full border border-hairline bg-transparent transition-colors focus-within:border-brand"
        style={{
          paddingInline: "clamp(0.75rem, 1.1vw, 1rem)",
          minHeight: "2.5rem",
        }}
      />
    </div>
  );
}

function DemoBanner() {
  return (
    <div
      className="flex items-center gap-3 border-b border-heat/40 bg-heat/10 pad-x py-3 font-mono tracking-[0.25em] uppercase text-heat"
      style={{ fontSize: "clamp(10px, 0.3vw + 9px, 11px)" }}
    >
      <span aria-hidden className="size-1.5 rounded-full bg-heat" />
      Demo mode — clicking Place Order will simulate a mock approval. No
      card data is transmitted.
    </div>
  );
}
