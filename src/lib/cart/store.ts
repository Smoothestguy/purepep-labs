"use client";

import { useEffect, useState } from "react";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Compound } from "@/lib/compounds";
import { slugify } from "@/lib/compounds";

/**
 * Cart shape — tiny, slug-keyed, fully persistable to localStorage.
 * We keep only the line-level fields we render so a stale cart after a
 * catalog update still renders, even if a compound's price drifted.
 */
export type CartItem = {
  slug: string;
  name: string;
  accession: string;
  dose: string;
  price: number;
  quantity: number;
};

export type CartState = {
  items: CartItem[];
  addItem: (compound: Compound) => void;
  removeItem: (slug: string) => void;
  updateQuantity: (slug: string, qty: number) => void;
  clear: () => void;
};

/**
 * We use `skipHydration: true` so the raw store is identical on server
 * and client at first render. Consumers call `useCart()` which waits for
 * `persist.rehydrate()` before exposing the persisted snapshot. This
 * avoids React hydration mismatch warnings entirely.
 */
export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (compound) => {
        const slug = slugify(compound.name);
        const existing = get().items.find((i) => i.slug === slug);
        if (existing) {
          set({
            items: get().items.map((i) =>
              i.slug === slug ? { ...i, quantity: i.quantity + 1 } : i,
            ),
          });
          return;
        }
        set({
          items: [
            ...get().items,
            {
              slug,
              name: compound.name,
              accession: compound.accession,
              dose: compound.dose,
              price: compound.price,
              quantity: 1,
            },
          ],
        });
      },
      removeItem: (slug) =>
        set({ items: get().items.filter((i) => i.slug !== slug) }),
      updateQuantity: (slug, qty) => {
        if (qty <= 0) {
          set({ items: get().items.filter((i) => i.slug !== slug) });
          return;
        }
        set({
          items: get().items.map((i) =>
            i.slug === slug ? { ...i, quantity: qty } : i,
          ),
        });
      },
      clear: () => set({ items: [] }),
    }),
    {
      name: "purepep-cart",
      storage: createJSONStorage(() =>
        typeof window === "undefined"
          ? // Dummy storage for SSR — persist never actually runs
            {
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

/** Derived selectors — keep subtotal/count OUT of stored state. */
export function selectSubtotal(state: CartState): number {
  return state.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
}

export function selectCount(state: CartState): number {
  return state.items.reduce((sum, i) => sum + i.quantity, 0);
}

/**
 * Hydration-safe hook. Returns `hydrated: false` and an empty snapshot on
 * the first client render, then flips to `true` with the real persisted
 * state on the second render. Components use `hydrated` to gate count
 * badges, empty-state copy, etc.
 */
export function useCart() {
  const state = useCartStore();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Rehydrate once on mount. No-op on the server. The synchronous
    // setState is intentional — we need the next render to read the
    // rehydrated store so SSR/CSR markup stays identical on first paint.
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
