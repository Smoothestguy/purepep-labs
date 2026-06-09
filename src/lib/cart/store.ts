"use client";

import { useEffect, useState } from "react";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Compound, Variant } from "@/lib/compounds";
import { slugify } from "@/lib/compounds";

/**
 * Cart shape — composite-keyed by `${slug}::${dose}` so different variants
 * (e.g. Retatrutide 10mg vs 60mg) are independent line items. We snapshot
 * the line-level fields we render so a stale cart after a catalog update
 * still renders, even if a price drifted.
 */
export type CartItem = {
  key: string;
  slug: string;
  name: string;
  accession: string;
  dose: string;
  price: number;
  quantity: number;
};

export type CartState = {
  items: CartItem[];
  addItem: (compound: Compound, variant: Variant) => void;
  removeItem: (key: string) => void;
  updateQuantity: (key: string, qty: number) => void;
  clear: () => void;
};

export function cartItemKey(slug: string, dose: string): string {
  return `${slug}::${dose}`;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (compound, variant) => {
        const slug = slugify(compound.name);
        const key = cartItemKey(slug, variant.dose);
        const existing = get().items.find((i) => i.key === key);
        if (existing) {
          set({
            items: get().items.map((i) =>
              i.key === key ? { ...i, quantity: i.quantity + 1 } : i,
            ),
          });
          return;
        }
        set({
          items: [
            ...get().items,
            {
              key,
              slug,
              name: compound.name,
              accession: compound.accession,
              dose: variant.dose,
              price: variant.price,
              quantity: 1,
            },
          ],
        });
      },
      removeItem: (key) =>
        set({ items: get().items.filter((i) => i.key !== key) }),
      updateQuantity: (key, qty) => {
        if (qty <= 0) {
          set({ items: get().items.filter((i) => i.key !== key) });
          return;
        }
        set({
          items: get().items.map((i) =>
            i.key === key ? { ...i, quantity: qty } : i,
          ),
        });
      },
      clear: () => set({ items: [] }),
    }),
    {
      name: "purepep-cart",
      storage: createJSONStorage(() =>
        typeof window === "undefined"
          ? {
              getItem: () => null,
              setItem: () => {},
              removeItem: () => {},
            }
          : window.localStorage,
      ),
      skipHydration: true,
    },
  ),
);

export function selectSubtotal(state: CartState): number {
  return state.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
}

export function selectCount(state: CartState): number {
  return state.items.reduce((sum, i) => sum + i.quantity, 0);
}

export function useCart() {
  const state = useCartStore();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void useCartStore.persist.rehydrate();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHydrated(true);
  }, []);

  return {
    hydrated,
    items: hydrated ? state.items : [],
    subtotal: hydrated ? selectSubtotal(state) : 0,
    count: hydrated ? selectCount(state) : 0,
    addItem: state.addItem,
    removeItem: state.removeItem,
    updateQuantity: state.updateQuantity,
    clear: state.clear,
  };
}
