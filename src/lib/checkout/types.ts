/**
 * The /api/checkout request and response contract.
 *
 * Processor-agnostic on purpose. This used to live under `lib/nmi/`, which
 * stopped making sense once cards moved to Stripe and NMI became the
 * fallback: the contract between our own browser and our own API is not
 * any one gateway's business.
 */

export type CheckoutShipping = {
  firstName: string;
  lastName: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
};

export type CheckoutLineItem = {
  slug: string;
  accession: string;
  name: string;
  dose: string;
  price: number;
  quantity: number;
};

export type CheckoutRequest = {
  /**
   * CollectJS one-time token. Empty for manual methods and for Stripe,
   * which collects the card on its own hosted page.
   */
  token: string;
  email: string;
  shipping: CheckoutShipping;
  items: CheckoutLineItem[];
  total: number;
  /** Defaults to "card" when omitted. */
  paymentMethod?: "card" | "bank_transfer" | "crypto";
};

export type CheckoutResponse =
  | {
      ok: true;
      orderId: string;
      message: string;
      /** Manual orders await funds; the UI shows instructions, not a receipt. */
      awaitingPayment?: boolean;
      /**
       * Present when payment happens off-site (Stripe Checkout). The client
       * must navigate here; the order is not paid until the customer
       * completes the hosted page and the webhook lands.
       */
      redirectUrl?: string;
    }
  | { ok: false; error: string };
