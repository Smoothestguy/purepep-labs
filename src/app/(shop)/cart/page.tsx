import type { Metadata } from "next";
import { CartContents } from "@/components/shop/cart-contents";

export const metadata: Metadata = {
  title: "Cart — PurePep Labs",
  description: "Review queued monographs before proceeding to checkout.",
};

export default function CartPage() {
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
          <span className="whitespace-nowrap text-brand">§ 09</span>
          <span
            className="h-px shrink-0 bg-hairline"
            style={{ width: "clamp(1.5rem, 3vw, 2.75rem)" }}
          />
          <span>Cart</span>
        </div>
        <h1
          className="display-lg"
          style={{ marginTop: "clamp(1rem, 1.5vw, 1.5rem)" }}
        >
          The bench
          <span className="italic font-light text-muted-foreground">
            {" "}
            — review, then
          </span>{" "}
          <span className="italic text-gradient-brand">proceed.</span>
        </h1>
        <p
          className="body-lede max-w-xl"
          style={{ marginTop: "clamp(1rem, 1.5vw, 1.25rem)" }}
        >
          Review your order, then proceed to checkout. Every vial ships
          cold-chain with a signed Certificate of Analysis.
        </p>
      </div>

      <CartContents />
    </section>
  );
}
