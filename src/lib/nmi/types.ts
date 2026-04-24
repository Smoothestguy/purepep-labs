/**
 * Types for NMI's CollectJS tokenization library + our internal
 * /api/checkout request/response contract. We type the global shape
 * minimally — enough to call `configure` and `startPaymentRequest`,
 * without leaning on an `@types/collectjs` package that does not exist.
 */

export type CollectJSTokenResponse = {
  token: string;
  tokenType: "card" | "ach" | string;
  card?: {
    number: string;
    bin: string;
    exp: string;
    type: string;
  };
};

export type CollectJSValidationField =
  | "ccnumber"
  | "ccexp"
  | "cvv";

export type CollectJSConfig = {
  variant?: "inline" | "lightbox";
  paymentSelector?: string;
  callback?: (response: CollectJSTokenResponse) => void;
  validationCallback?: (
    field: CollectJSValidationField,
    status: boolean,
    message: string,
  ) => void;
  fieldsAvailableCallback?: () => void;
  customCss?: Record<string, string>;
  focusCss?: Record<string, string>;
  invalidCss?: Record<string, string>;
  validCss?: Record<string, string>;
  placeholderCss?: Record<string, string>;
  fields?: {
    ccnumber?: { selector: string; placeholder?: string; title?: string };
    ccexp?: { selector: string; placeholder?: string; title?: string };
    cvv?: { selector: string; placeholder?: string; title?: string };
  };
};

export type CollectJSGlobal = {
  configure: (config: CollectJSConfig) => void;
  startPaymentRequest: () => void;
};

declare global {
  interface Window {
    CollectJS?: CollectJSGlobal;
  }
}

// ── Internal /api/checkout contract ──────────────────────────────────

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
  token: string; // CollectJS one-time token, or "MOCK" in demo mode
  email: string;
  shipping: CheckoutShipping;
  items: CheckoutLineItem[];
  total: number;
};

export type CheckoutResponse =
  | { ok: true; orderId: string; message: string }
  | { ok: false; error: string };
