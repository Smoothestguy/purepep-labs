import { compoundBySlug } from "@/lib/compounds";

/**
 * Order pricing — the single source of truth for what an order costs.
 *
 * Everything here works in integer cents. Dollar floats are fine for
 * display but must never be summed: 39.99 * 3 === 119.96999999999998, and
 * a total that disagrees with the gateway by a cent is a support ticket.
 *
 * The functions below deliberately ignore any price or total sent by the
 * browser. A checkout payload is treated as a request for *quantities of
 * SKUs*, never as a statement of what those SKUs cost — otherwise anyone
 * can POST `total: 0.01` and buy the catalog.
 */

/** Flat-rate cold-chain shipping, in dollars. */
export const SHIPPING_FLAT = 18;

/** Flat-rate cold-chain shipping, in cents. */
export const SHIPPING_FLAT_CENTS = SHIPPING_FLAT * 100;

/** Upper bound per line item — a sanity guard, not a stock check. */
const MAX_QUANTITY_PER_LINE = 99;

export function toCents(dollars: number): number {
  return Math.round(dollars * 100);
}

export function formatCents(cents: number): string {
  return (cents / 100).toFixed(2);
}

/** What the browser asks for: a SKU and how many. Prices are not trusted. */
export type RequestedLine = {
  slug: string;
  dose: string;
  quantity: number;
};

/** What we decided it costs, after catalog lookup. */
export type PricedLine = {
  slug: string;
  accession: string;
  name: string;
  dose: string;
  unit_price_cents: number;
  quantity: number;
  line_total_cents: number;
  /**
   * Unit price actually charged, after any discount. Equal to
   * `unit_price_cents` when no code was applied.
   *
   * Kept alongside the list price rather than replacing it so an order row
   * still records what the customer would have paid — needed to show a
   * saving on the receipt, and to audit what a code gave away.
   */
  charged_unit_price_cents: number;
};

export type PricedOrder = {
  items: PricedLine[];
  subtotalCents: number;
  shippingCents: number;
  /** Amount taken off the order. Zero unless a code was applied. */
  discountCents: number;
  /** The code responsible, canonical spelling. Null when none. */
  discountCode: string | null;
  /** Whole percent off. Zero when no code was applied. */
  discountPercent: number;
  /** Shipping actually charged, after any discount. */
  chargedShippingCents: number;
  totalCents: number;
};

export type PricingResult =
  | { ok: true; order: PricedOrder }
  | { ok: false; error: string };

/**
 * Resolve requested lines against the live catalog and compute the total.
 *
 * Fails closed: an unknown slug, an unknown dose, or a nonsense quantity
 * rejects the whole order rather than silently dropping a line (a dropped
 * line would charge the customer for less than their cart showed).
 */
export function priceOrder(requested: RequestedLine[]): PricingResult {
  if (!Array.isArray(requested) || requested.length === 0) {
    return { ok: false, error: "Cart is empty." };
  }

  const items: PricedLine[] = [];

  for (const line of requested) {
    const compound = compoundBySlug(line.slug);
    if (!compound) {
      return { ok: false, error: `Unknown product: ${line.slug}` };
    }

    const variant = compound.variants.find((v) => v.dose === line.dose);
    if (!variant) {
      return {
        ok: false,
        error: `Unknown dose "${line.dose}" for ${compound.name}.`,
      };
    }

    const quantity = Number(line.quantity);
    if (
      !Number.isInteger(quantity) ||
      quantity < 1 ||
      quantity > MAX_QUANTITY_PER_LINE
    ) {
      return {
        ok: false,
        error: `Invalid quantity for ${compound.name} ${variant.dose}.`,
      };
    }

    const unit = toCents(variant.price);
    items.push({
      slug: line.slug,
      accession: compound.accession,
      name: compound.name,
      dose: variant.dose,
      unit_price_cents: unit,
      quantity,
      line_total_cents: unit * quantity,
      charged_unit_price_cents: unit,
    });
  }

  const subtotalCents = items.reduce((sum, i) => sum + i.line_total_cents, 0);
  const shippingCents = subtotalCents > 0 ? SHIPPING_FLAT_CENTS : 0;

  return {
    ok: true,
    order: {
      items,
      subtotalCents,
      shippingCents,
      discountCents: 0,
      discountCode: null,
      discountPercent: 0,
      chargedShippingCents: shippingCents,
      totalCents: subtotalCents + shippingCents,
    },
  };
}

/**
 * Apply a percentage discount to an already-priced order.
 *
 * The rounding here is load-bearing. Stripe computes a line as
 * `unit_amount * quantity`, so the discount is applied to the *unit*
 * price and rounded there, before multiplying — then our total is summed
 * from those same rounded units. Discounting the line total instead would
 * drift by a cent on some quantities, and the webhook asserts that
 * Stripe's `amount_total` equals what we recorded.
 *
 * Shipping is discounted too. "15% off" that still bills full freight is
 * a support ticket, and at 100% it makes the order properly free.
 *
 * Returns a new order; the caller keeps the undiscounted one for the
 * audit trail.
 */
export function applyDiscount(
  order: PricedOrder,
  discount: { code: string; percent: number },
): PricedOrder {
  const multiplier = (100 - discount.percent) / 100;

  const items = order.items.map((item) => {
    const chargedUnit = Math.round(item.unit_price_cents * multiplier);
    return { ...item, charged_unit_price_cents: chargedUnit };
  });

  const chargedSubtotal = items.reduce(
    (sum, i) => sum + i.charged_unit_price_cents * i.quantity,
    0,
  );
  const chargedShipping = Math.round(order.shippingCents * multiplier);
  const totalCents = chargedSubtotal + chargedShipping;

  const gross = order.subtotalCents + order.shippingCents;

  return {
    ...order,
    items,
    discountCents: gross - totalCents,
    discountCode: discount.code,
    discountPercent: discount.percent,
    chargedShippingCents: chargedShipping,
    totalCents,
  };
}
