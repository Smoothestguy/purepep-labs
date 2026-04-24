import type { Metadata } from "next";
import { CheckoutForm } from "@/components/shop/checkout-form";

export const metadata: Metadata = {
  title: "Checkout — PurePep Labs",
  description: "Finalise your order. Cold-chain dispatch within one business day.",
};

export default function CheckoutPage() {
  return (
    <section className="relative border-b border-hairline">
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
          Enter shipping and payment. We dispatch cold-chain within one
          business day and email a signed CoA with every lot.
        </p>
      </div>

      <CheckoutForm />
    </section>
  );
}
