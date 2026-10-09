/**
 * Types for NMI's CollectJS tokenization library. We type the global shape
 * minimally — enough to call `configure` and `startPaymentRequest`,
 * without leaning on an `@types/collectjs` package that does not exist.
 *
 * The /api/checkout contract lives in `lib/checkout/types`; it is not
 * NMI-specific and outlived this integration's turn as the card handler.
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
