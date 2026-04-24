"use client";

import { useCart, type CartItem } from "@/lib/cart/store";

type Props = {
  item: CartItem;
};

export function LineItem({ item }: Props) {
  const { updateQuantity, removeItem } = useCart();
  const lineSubtotal = item.price * item.quantity;

  return (
    <div
      className="grid grid-cols-[1fr_auto] items-start gap-x-4 gap-y-3 border-b border-hairline py-5 sm:grid-cols-[1fr_auto_auto_auto] sm:items-center sm:gap-x-6"
      style={{ paddingBlock: "clamp(1.1rem, 1.8vw, 1.5rem)" }}
    >
      {/* Identity */}
      <div className="min-w-0">
        <div
          className="font-mono tracking-[0.22em] uppercase text-muted-foreground"
          style={{ fontSize: "clamp(9.5px, 0.25vw + 8.5px, 10.5px)" }}
        >
          {item.accession}
        </div>
        <div
          className="mt-1 font-display leading-tight tracking-tight text-foreground"
          style={{ fontSize: "clamp(1.25rem, 2vw, 1.75rem)" }}
        >
          {item.name}
        </div>
        <div
          className="mt-1 font-mono tracking-[0.05em] text-muted-foreground"
          style={{ fontSize: "clamp(10.5px, 0.25vw + 9.5px, 11.5px)" }}
        >
          {item.dose} · ${item.price} / vial
        </div>
      </div>

      {/* Quantity stepper */}
      <div
        className="row-start-2 col-span-1 flex items-center border border-hairline font-mono sm:row-start-1 sm:col-span-1"
        style={{ fontSize: "clamp(11px, 0.3vw + 10px, 12px)" }}
      >
        <button
          type="button"
          aria-label={`Decrease ${item.name} quantity`}
          onClick={() => updateQuantity(item.slug, item.quantity - 1)}
          className="inline-flex size-9 items-center justify-center text-foreground transition-colors hover:bg-surface/60"
        >
          −
        </button>
        <span
          aria-live="polite"
          className="inline-flex size-9 items-center justify-center border-x border-hairline text-foreground"
        >
          {item.quantity}
        </span>
        <button
          type="button"
          aria-label={`Increase ${item.name} quantity`}
          onClick={() => updateQuantity(item.slug, item.quantity + 1)}
          className="inline-flex size-9 items-center justify-center text-foreground transition-colors hover:bg-surface/60"
        >
          +
        </button>
      </div>

      {/* Line subtotal */}
      <div
        className="row-start-2 col-start-2 justify-self-end text-right font-display tracking-tight text-foreground sm:row-start-1 sm:col-start-3"
        style={{ fontSize: "clamp(1.1rem, 1.6vw, 1.4rem)" }}
      >
        ${lineSubtotal.toFixed(2)}
      </div>

      {/* Remove */}
      <button
        type="button"
        onClick={() => removeItem(item.slug)}
        className="col-start-2 row-start-1 justify-self-end whitespace-nowrap font-mono tracking-[0.22em] uppercase text-muted-foreground transition-colors hover:text-foreground sm:col-start-4 sm:row-start-1"
        style={{ fontSize: "clamp(9.5px, 0.25vw + 8.5px, 10.5px)" }}
      >
        Remove
      </button>
    </div>
  );
}
