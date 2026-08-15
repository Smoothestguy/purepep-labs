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
};

export type PricedOrder = {
  items: PricedLine[];
  subtotalCents: number;
  shippingCents: number;
  /** Amount taken off the order. Zero unless a comp code was applied. */
  discountCents: number;
  /** The comp code responsible, canonical spelling. Null when none. */
  discountCode: string | null;
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
      totalCents: subtotalCents + shippingCents,
    },
  };
}

/**
 * Apply a full comp to an already-priced order.
 *
 * Shipping is waived along with the goods — "100% off" that still bills
 * $18 for cold-chain dispatch is a support ticket, not a comp.
 *
 * Returns a new order rather than mutating, so the undiscounted total
 * stays available to the caller for the audit trail.
 */
export function compOrder(order: PricedOrder, code: string): PricedOrder {
  const gross = order.subtotalCents + order.shippingCents;
  return {
    ...order,
    discountCents: gross,
    discountCode: code,
    totalCents: 0,
  };
}
