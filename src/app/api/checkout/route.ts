import type { NextRequest } from "next/server";
import type { CheckoutResponse, CheckoutShipping } from "@/lib/checkout/types";
import { chargeCard, isGatewayConfigured } from "@/lib/nmi/gateway";
import { compOrder, priceOrder, type RequestedLine } from "@/lib/pricing";
import { lookupCompCode } from "@/lib/discounts";
import {
  attachStripeSession,
  createPendingOrder,
  generateOrderRef,
  markOrderComped,
  markOrderFailed,
  markOrderPaid,
} from "@/lib/orders";
import { getCurrentUser } from "@/lib/auth/user";
import { resolveSiteOrigin } from "@/lib/site-url";
import { cardProcessor, enabledMethods } from "@/lib/payments/processor";
import { createCheckoutSession } from "@/lib/stripe/checkout";
import { sendOrderConfirmation, sendPaymentInstructions } from "@/lib/email";
import { isManual, isPaymentMethod, type PaymentMethod } from "@/lib/payment-methods";
import { paymentInstructions } from "@/lib/payment-instructions";

/**
 * POST /api/checkout
 *
 * Order of operations matters here:
 *   1. Require a signed-in researcher — purchasing is gated.
 *   2. Validate the payload shape.
 *   3. Re-price the cart from the catalog — the browser's prices and total
 *      are ignored entirely (see lib/pricing).
 *   4. Write a 'pending' order, so a row exists even if step 5 dies.
 *   5. Hand off to the processor.
 *
 * Step 5 differs by processor. NMI settles inline: the card is charged
 * here and the order is paid (or declined) before the response returns.
 * Stripe does not — we mint a Checkout Session, hand back its URL, and the
 * order stays 'pending' until the `checkout.session.completed` webhook
 * arrives. Nothing in this handler may ever report a Stripe order as paid.
 *
 * Card data never reaches this handler under either processor.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isString(v: unknown): v is string {
  return typeof v === "string" && v.length > 0;
}

function validateShipping(s: unknown): s is CheckoutShipping {
  if (typeof s !== "object" || s === null) return false;
  const r = s as Record<string, unknown>;
  return (
    isString(r.firstName) &&
    isString(r.lastName) &&
    isString(r.address1) &&
    isString(r.city) &&
    isString(r.state) &&
    isString(r.zip) &&
    isString(r.phone)
  );
}

type ParsedBody = {
  token: string;
  email: string;
  shipping: CheckoutShipping;
  lines: RequestedLine[];
  paymentMethod: PaymentMethod;
  discountCode: string;
};

function parseBody(body: unknown): ParsedBody | null {
  if (typeof body !== "object" || body === null) return null;
  const r = body as Record<string, unknown>;

  // Omitted method means card, for older clients.
  const paymentMethod: PaymentMethod = isPaymentMethod(r.paymentMethod)
    ? r.paymentMethod
    : "card";

  // Only the NMI card path expects a token; Stripe collects the card on
  // its own page, and manual methods have no card at all.
  if (
    paymentMethod === "card" &&
    cardProcessor() === "nmi" &&
    !isString(r.token)
  ) {
    return null;
  }
  if (!isString(r.email) || !EMAIL_RE.test(r.email.trim())) return null;
  if (!validateShipping(r.shipping)) return null;
  if (!Array.isArray(r.items) || r.items.length === 0) return null;

  const lines: RequestedLine[] = [];
  for (const item of r.items) {
    if (typeof item !== "object" || item === null) return null;
    const i = item as Record<string, unknown>;
    // Note: any `price` the client sent is intentionally discarded.
    if (!isString(i.slug) || !isString(i.dose)) return null;
    if (typeof i.quantity !== "number") return null;
    lines.push({ slug: i.slug, dose: i.dose, quantity: i.quantity });
  }

  return {
    token: isString(r.token) ? r.token : "",
    email: r.email.trim(),
    shipping: r.shipping,
    lines,
    paymentMethod,
    discountCode: isString(r.discountCode) ? r.discountCode : "",
  };
}

function fail(error: string, status: number): Response {
  return Response.json({ ok: false, error } satisfies CheckoutResponse, {
    status,
  });
}

/**
 * Mock approvals are a development affordance for the NMI path. Allowing
 * them in production would mean customers receive "order confirmed" pages
 * for money that was never taken — so they are off unless explicitly opted
 * into. Stripe has no equivalent: use its test keys instead.
 */
function mockAllowed(): boolean {
  if (process.env.ALLOW_MOCK_CHECKOUT === "true") return true;
  return process.env.NODE_ENV !== "production";
}

export async function POST(request: NextRequest): Promise<Response> {
  // ── Purchasing requires an account ───────────────────────────────────
  //
  // Checked before anything else: an unauthenticated request should not
  // be able to probe pricing or catalog errors either.
  const user = await getCurrentUser();
  if (!user) {
    return fail("Please sign in to place an order.", 401);
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return fail("Invalid JSON body.", 400);
  }

  const body = parseBody(json);
  if (!body) {
    return fail(
      "Missing or invalid fields. Expected email, shipping, items.",
      400,
    );
  }

  // ── Authoritative pricing ────────────────────────────────────────────
  const priced = priceOrder(body.lines);
  if (!priced.ok) return fail(priced.error, 400);

  // ── Comp code ────────────────────────────────────────────────────────
  //
  // Validated here and nowhere else. The browser is told only whether the
  // code worked, never which codes exist, so a rejected code leaks nothing
  // beyond "not that one".
  let order = priced.order;
  if (body.discountCode) {
    const comp = lookupCompCode(body.discountCode);
    if (!comp) return fail("That discount code is not valid.", 400);
    order = compOrder(order, comp.code);
  }

  const {
    items,
    subtotalCents,
    shippingCents,
    discountCents,
    discountCode,
    totalCents,
  } = order;

  // A comped order has nothing to charge, so no processor is involved at
  // all — whichever payment method was selected becomes irrelevant.
  const comped = totalCents === 0;

  // ── Payment method must actually be switched on ──────────────────────
  const method = body.paymentMethod;
  if (!enabledMethods().includes(method)) {
    return fail("That payment method is not available.", 400);
  }

  const manual = isManual(method);
  const processor = cardProcessor();
  const usingStripe = !comped && !manual && processor === "stripe";

  // Card-only preflight: refuse rather than fake an approval in production.
  const nmiReady = isGatewayConfigured();
  if (!comped && !manual && processor === "nmi" && !nmiReady && !mockAllowed()) {
    return fail(
      "Card payments are not available yet. Please contact us to place this order.",
      503,
    );
  }

  let origin: string | null = null;
  if (usingStripe) {
    origin = resolveSiteOrigin(request.nextUrl.origin);
    if (!origin) {
      console.error(
        "[checkout] cannot resolve site origin — set NEXT_PUBLIC_SITE_URL.",
      );
      return fail("Checkout is misconfigured. Please contact us.", 503);
    }
  }

  const orderRef = generateOrderRef();

  // ── Persist before charging ──────────────────────────────────────────
  let persisted = true;
  try {
    await createPendingOrder({
      orderRef,
      userId: user.id,
      email: body.email,
      items,
      shipping: body.shipping,
      subtotalCents,
      shippingCents,
      totalCents,
      paymentMethod: method,
      gateway: comped || manual ? null : processor,
      discountCents,
      discountCode,
    });
  } catch (err) {
    persisted = false;
    const message = err instanceof Error ? err.message : String(err);
    console.error("[checkout] could not persist order:", message);

    // In production, taking money we cannot attribute to an order is worse
    // than declining the sale.
    if (process.env.NODE_ENV === "production") {
      return fail(
        "We could not record your order. No payment was taken. Please try again.",
        503,
      );
    }
  }

  // ── Comped: settle immediately, nothing to charge ────────────────────
  //
  // Checked before the manual and card branches because a zero total makes
  // both meaningless — there is no money to instruct anyone to send, and
  // no amount to authorise.
  if (comped) {
    if (!persisted) {
      return fail(
        "We could not record your order. Please try again or contact us.",
        503,
      );
    }

    const { transitioned } = await markOrderComped(
      orderRef,
      discountCode as string,
    );

    if (transitioned) {
      try {
        await sendOrderConfirmation({
          to: body.email,
          orderRef,
          items,
          subtotalCents,
          shippingCents,
          totalCents,
        });
      } catch (err) {
        console.error(
          `[checkout] ${orderRef}: comp confirmation email failed:`,
          err instanceof Error ? err.message : err,
        );
      }
    }

    console.info(
      `[checkout] ${orderRef}: comped with "${discountCode}" (${discountCents}c waived).`,
    );

    return Response.json(
      {
        ok: true,
        orderId: orderRef,
        message: "Order confirmed — no payment required.",
      } satisfies CheckoutResponse,
      { status: 200 },
    );
  }

  // ── Manual methods: no charge, just instructions ─────────────────────
  //
  // A manual order that we failed to persist is worthless — nobody would
  // know to expect the money — so unlike a card sale this always fails
  // loudly rather than proceeding.
  if (manual) {
    if (!persisted) {
      return fail(
        "We could not record your order. Please try again or contact us.",
        503,
      );
    }

    try {
      await sendPaymentInstructions({
        to: body.email,
        orderRef,
        method,
        instructions: paymentInstructions(method),
        items,
        subtotalCents,
        shippingCents,
        totalCents,
      });
    } catch (err) {
      // The order exists and is visible in the admin queue, so this is
      // recoverable by hand — don't fail the customer's checkout over it.
      console.error(
        `[checkout] ${orderRef}: instructions email failed:`,
        err instanceof Error ? err.message : err,
      );
    }

    return Response.json(
      {
        ok: true,
        orderId: orderRef,
        awaitingPayment: true,
        message: "Order recorded. Payment instructions sent by email.",
      } satisfies CheckoutResponse,
      { status: 200 },
    );
  }

  // ── Stripe: hand off to the hosted page ──────────────────────────────
  //
  // Like the manual methods, this refuses to continue without a persisted
  // order: the webhook settles the payment by looking the order up, so a
  // session minted against a row that does not exist would take money we
  // could never attribute.
  if (usingStripe) {
    if (!persisted) {
      return fail(
        "We could not record your order. No payment was taken. Please try again.",
        503,
      );
    }

    const session = await createCheckoutSession({
      order: priced.order,
      orderRef,
      email: body.email,
      userId: user.id,
      shipping: body.shipping,
      origin: origin as string,
    });

    if (!session.ok) {
      await markOrderFailed(orderRef, session.error);
      return fail(session.error, 502);
    }

    try {
      await attachStripeSession(orderRef, session.sessionId);
    } catch (err) {
      // Recoverable: the webhook also resolves the order from the
      // `order_ref` metadata on the session, so a missed write here does
      // not strand the payment.
      console.error(
        `[checkout] ${orderRef}: could not attach session id:`,
        err instanceof Error ? err.message : err,
      );
    }

    return Response.json(
      {
        ok: true,
        orderId: orderRef,
        redirectUrl: session.url,
        message: "Redirecting to secure payment.",
      } satisfies CheckoutResponse,
      { status: 200 },
    );
  }

  // ── NMI: charge inline ───────────────────────────────────────────────
  if (!nmiReady) {
    console.warn(
      `[checkout] ${orderRef}: gateway not configured — mock approval (no payment taken).`,
    );
    return Response.json(
      {
        ok: true,
        orderId: orderRef,
        message:
          "Mock approval — no payment was taken (gateway not configured).",
      } satisfies CheckoutResponse,
      { status: 200 },
    );
  }

  const charge = await chargeCard({
    token: body.token,
    amountCents: totalCents,
    email: body.email,
    shipping: body.shipping,
    orderRef,
  });

  if (!charge.ok) {
    if (persisted) {
      await markOrderFailed(orderRef, charge.message, charge.raw);
    }
    console.warn(`[checkout] ${orderRef}: ${charge.kind} — ${charge.message}`);
    // 402 for a genuine decline; 502 when the processor itself misbehaved.
    return fail(charge.message, charge.kind === "declined" ? 402 : 502);
  }

  if (persisted) {
    try {
      await markOrderPaid(orderRef, {
        transactionId: charge.transactionId,
        authCode: charge.authCode,
        raw: charge.raw,
      });
    } catch (err) {
      // The customer's card was charged — never fail the response here.
      console.error(
        `[checkout] ${orderRef}: charged but not marked paid:`,
        err instanceof Error ? err.message : err,
      );
    }
  }

  // Confirmation email is best-effort; a mail outage must not turn a
  // successful payment into an error page.
  try {
    await sendOrderConfirmation({
      to: body.email,
      orderRef,
      items,
      subtotalCents,
      shippingCents,
      totalCents,
    });
  } catch (err) {
    console.error(
      `[checkout] ${orderRef}: confirmation email failed:`,
      err instanceof Error ? err.message : err,
    );
  }

  return Response.json(
    {
      ok: true,
      orderId: orderRef,
      message: "Payment approved.",
    } satisfies CheckoutResponse,
    { status: 200 },
  );
}
