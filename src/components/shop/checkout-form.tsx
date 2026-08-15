"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { useCart } from "@/lib/cart/store";
import {
  loadCollectJS,
  configureCollectJS,
  startCollectJSPaymentRequest,
} from "@/lib/nmi/collect-js";
import type { CollectJSTokenResponse } from "@/lib/nmi/types";
import type {
  CheckoutRequest,
  CheckoutResponse,
  CheckoutShipping,
} from "@/lib/checkout/types";
import { OrderSummary, SHIPPING_FLAT } from "./order-summary";
import {
  METHOD_BLURB,
  METHOD_LABEL,
  isManual,
  type PaymentMethod,
} from "@/lib/payment-methods";

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

type Props = {
  /**
   * Offered methods, resolved on the server — deciding whether card is
   * available needs a secret key, so it cannot be worked out here.
   */
  methods: PaymentMethod[];
  /** Which processor handles a card payment. */
  processor: "stripe" | "nmi";
  /**
   * The signed-in account's email, used to seed the contact field.
   * Ordering requires an account, so the server always knows this —
   * asking the customer to retype it is pure friction.
   */
  defaultEmail: string;
};

/**
 * Long, single-form checkout. Three sections — contact, shipping,
 * payment — separated by hairlines. Review column (OrderSummary) is
 * sticky on lg+.
 *
 * How the card section behaves depends on the processor. Under Stripe
 * there are no card fields at all: we collect contact and shipping, then
 * hand off to Stripe's hosted page. Under NMI, CollectJS mounts its
 * iframes here and tokenises before submit — or, with no tokenization key,
 * a clearly-labelled mock banner is shown and the form submits `MOCK`.
 */
export function CheckoutForm({ methods, processor, defaultEmail }: Props) {
  const router = useRouter();
  const { items, subtotal, clear, hydrated } = useCart();

  const usingCollectJs = processor === "nmi";
  const hasTokenKey = Boolean(process.env.NEXT_PUBLIC_NMI_TOKENIZATION_KEY);
  // Mock approvals only ever existed for NMI; Stripe has test keys instead.
  const demoMode = usingCollectJs && !hasTokenKey;

  const [method, setMethod] = useState<PaymentMethod>(
    () => methods[0] ?? "card",
  );
  const manualSelected = isManual(method);
  const stripeSelected = !manualSelected && processor === "stripe";

  // CollectJS is configured once on mount and binds to the submit button,
  // so its callback closes over the method as it was at configure time.
  // A ref keeps it reading the live value — otherwise switching to bank
  // transfer after mount would still fire tokenization and double-submit.
  const methodRef = useRef<PaymentMethod>(method);
  useEffect(() => {
    methodRef.current = method;
  }, [method]);

  // Seeded from the account, but still editable — a shared lab inbox is a
  // legitimate place to want the receipt sent.
  const [email, setEmail] = useState(defaultEmail);
  // Never validated here — the server owns which codes exist. This only
  // carries what was typed.
  const [discountCode, setDiscountCode] = useState("");
  const [applied, setApplied] = useState<{
    code: string;
    percent: number;
  } | null>(null);
  const [checkingCode, setCheckingCode] = useState(false);

  /**
   * Discount in dollars, mirroring the server's arithmetic exactly: the
   * percentage hits each *unit* price and is rounded there before being
   * multiplied by quantity. Rounding the line total instead would drift a
   * cent on some quantities and show a figure we don't charge.
   */
  const discountAmount = useMemo(() => {
    if (!applied) return 0;
    const multiplier = (100 - applied.percent) / 100;

    const grossCents =
      items.reduce((sum, i) => sum + Math.round(i.price * 100) * i.quantity, 0) +
      (subtotal > 0 ? SHIPPING_FLAT * 100 : 0);

    const chargedCents =
      items.reduce(
        (sum, i) =>
          sum + Math.round(Math.round(i.price * 100) * multiplier) * i.quantity,
        0,
      ) + Math.round((subtotal > 0 ? SHIPPING_FLAT * 100 : 0) * multiplier);

    return (grossCents - chargedCents) / 100;
  }, [applied, items, subtotal]);

  const appliedForSummary = applied
    ? { code: applied.code, amount: discountAmount }
    : null;

  async function checkCode() {
    const raw = discountCode.trim();
    if (!raw || checkingCode) return;

    setCheckingCode(true);
    try {
      const res = await fetch("/api/discount/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: raw }),
      });
      const data = (await res.json()) as {
        valid: boolean;
        code?: string;
        percent?: number;
      };

      if (data.valid && data.code && typeof data.percent === "number") {
        setApplied({ code: data.code, percent: data.percent });
        toast.success(`${data.code} applied — ${data.percent}% off.`);
      } else {
        setApplied(null);
        toast.error("That discount code is not valid.");
      }
    } catch {
      toast.error("Could not check that code. Try again.");
    } finally {
      setCheckingCode(false);
    }
  }
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

  // Load + configure CollectJS once — NMI only, and only with a real key.
  // Under Stripe this never runs: no card ever touches this page.
  useEffect(() => {
    if (!usingCollectJs || demoMode) return;

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
              // Ignore a stray tokenization if the customer switched to a
              // manual method — onSubmit already handled that path.
              if (isManual(methodRef.current)) return;
              void submitCheckout(response.token, "card");
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
  }, [usingCollectJs, demoMode]);

  async function submitCheckout(token: string, chosen: PaymentMethod = method) {
    try {
      const payload: CheckoutRequest = {
        token,
        paymentMethod: chosen,
        discountCode: discountCode.trim() || undefined,
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
        // 401 means the session lapsed between loading the page and
        // submitting — send them to sign in rather than showing a toast
        // they can't act on.
        if (res.status === 401) {
          toast.error("Please sign in to place an order.");
          router.push(`/login?redirect=${encodeURIComponent("/checkout")}`);
          return;
        }
        toast.error(
          ("error" in data && data.error) || "Checkout failed. Try again.",
        );
        setSubmitting(false);
        return;
      }

      // Stripe: hand off to the hosted page. The cart is deliberately not
      // cleared here — nothing has been paid yet, and a customer who backs
      // out or lets the session expire must return to a cart that still
      // holds their order. The success page clears it instead.
      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
        return;
      }

      clear();
      const awaiting = data.awaitingPayment ? "&awaiting=1" : "";
      router.push(
        `/checkout/success?order=${encodeURIComponent(data.orderId)}${awaiting}`,
      );
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

    // Neither manual methods nor Stripe tokenise here — there is no card
    // in this form to tokenise.
    if (manualSelected || stripeSelected) {
      void submitCheckout("", method);
      return;
    }

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

          <Section title="§ C · Discount code">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <div className="flex-1">
                <Field
                  id="discountCode"
                  label="Code (optional)"
                  autoComplete="off"
                  value={discountCode}
                  onChange={(v) => {
                    setDiscountCode(v);
                    // Typing invalidates a previously applied code, so the
                    // summary can't show a discount for a code no longer
                    // in the box.
                    if (applied) setApplied(null);
                  }}
                  placeholder="Enter a code"
                />
              </div>
              <button
                type="button"
                onClick={() => void checkCode()}
                disabled={checkingCode || !discountCode.trim()}
                className="shrink-0 border border-hairline font-mono tracking-[0.3em] uppercase text-foreground transition-colors hover:border-foreground disabled:cursor-not-allowed disabled:opacity-50"
                style={{
                  paddingInline: "clamp(1rem, 1.6vw, 1.4rem)",
                  paddingBlock: "clamp(0.7rem, 0.95vw, 0.9rem)",
                  fontSize: "clamp(10px, 0.3vw + 9px, 11px)",
                  minHeight: "2.5rem",
                }}
              >
                {checkingCode ? "Checking…" : "Apply"}
              </button>
            </div>
            <p
              className="font-sans leading-relaxed text-muted-foreground"
              style={{
                marginTop: "clamp(0.6rem, 1vw, 0.85rem)",
                fontSize: "clamp(11px, 0.3vw + 10px, 12.5px)",
              }}
            >
              {applied
                ? `${applied.code} applied — ${applied.percent}% off your order, shipping included.`
                : "Re-checked when you place the order. An invalid code stops the order rather than quietly charging full price."}
            </p>
          </Section>

          <Section title="§ D · Payment">
            {/* Method picker — only when there's an actual choice. */}
            {methods.length > 1 ? (
              <div
                role="radiogroup"
                aria-label="Payment method"
                className="grid grid-cols-1"
                style={{
                  gap: "clamp(0.5rem, 0.8vw, 0.65rem)",
                  marginBottom: "clamp(1.25rem, 2vw, 1.75rem)",
                }}
              >
                {methods.map((m) => {
                  const active = m === method;
                  return (
                    <button
                      key={m}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      onClick={() => setMethod(m)}
                      className={`flex items-start gap-3 border text-left transition-colors ${
                        active
                          ? "border-brand bg-brand/5"
                          : "border-hairline hover:border-foreground/40"
                      }`}
                      style={{ padding: "clamp(0.85rem, 1.3vw, 1.1rem)" }}
                    >
                      <span
                        aria-hidden
                        className={`mt-0.5 size-3 shrink-0 rounded-full border ${
                          active ? "border-brand bg-brand" : "border-hairline"
                        }`}
                      />
                      <span className="min-w-0">
                        <span
                          className={`block font-mono uppercase tracking-[0.18em] ${
                            active ? "text-brand" : "text-foreground"
                          }`}
                          style={{ fontSize: "clamp(10px, 0.28vw + 9px, 11px)" }}
                        >
                          {METHOD_LABEL[m]}
                        </span>
                        <span
                          className="mt-1 block font-sans leading-relaxed text-muted-foreground"
                          style={{
                            fontSize: "clamp(11px, 0.3vw + 10px, 12.5px)",
                          }}
                        >
                          {METHOD_BLURB[m]}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : null}

            {methods.length === 0 ? (
              <p
                className="border border-heat/40 bg-heat/10 font-mono text-heat"
                style={{
                  padding: "clamp(0.85rem, 1.3vw, 1.1rem)",
                  fontSize: "clamp(11px, 0.3vw + 10px, 12px)",
                }}
              >
                No payment methods are currently available. Please contact us to
                place this order.
              </p>
            ) : manualSelected ? (
              <p
                className="font-sans leading-relaxed text-muted-foreground"
                style={{ fontSize: "clamp(11px, 0.3vw + 10px, 12.5px)" }}
              >
                We&rsquo;ll email payment details and your order reference as
                soon as you place the order. Nothing is charged now, and your
                order is reserved until funds clear.
              </p>
            ) : stripeSelected ? (
              <p
                className="font-sans leading-relaxed text-muted-foreground"
                style={{ fontSize: "clamp(11px, 0.3vw + 10px, 12.5px)" }}
              >
                You&rsquo;ll be taken to Stripe&rsquo;s secure payment page to
                enter your card, then returned here. Card details never touch
                our servers, and nothing is charged until you confirm on that
                page.
              </p>
            ) : demoMode ? (
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
            <OrderSummary
              subtotal={subtotal}
              showDisclaimer={false}
              discount={appliedForSummary}
            />
          </div>
        </div>

        <div>
          <OrderSummary
            subtotal={subtotal}
            discount={appliedForSummary}
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
                <span>
                  {submitting
                    ? "Processing…"
                    : manualSelected
                      ? "Place order"
                      : stripeSelected
                        ? "Continue to payment"
                        : "Pay & place order"}
                </span>
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
