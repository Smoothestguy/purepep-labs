"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useCartStore } from "@/lib/cart/store";
import type { Compound } from "@/lib/compounds";

type Props = {
  compound: Compound;
};

export function BuyButton({ compound }: Props) {
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);

  return (
    <button
      type="button"
      onClick={() => {
        addItem(compound);
        toast.success("Added to cart", {
          description: `${compound.name} · $${compound.price}`,
          action: {
            label: "View cart",
            onClick: () => router.push("/cart"),
          },
        });
      }}
      className="group inline-flex w-full items-center justify-between gap-3 bg-brand font-mono tracking-[0.3em] uppercase text-brand-foreground transition-all hover:shadow-[0_0_0_4px_oklch(0.82_0.15_210_/_0.18)]"
      style={{
        paddingInline: "clamp(1.1rem, 1.8vw, 1.6rem)",
        paddingBlock: "clamp(0.85rem, 1.1vw, 1.1rem)",
        fontSize: "clamp(10px, 0.3vw + 9px, 11px)",
      }}
    >
      <span>Add to cart</span>
      <span className="transition-transform group-hover:translate-x-1">→</span>
    </button>
  );
}
