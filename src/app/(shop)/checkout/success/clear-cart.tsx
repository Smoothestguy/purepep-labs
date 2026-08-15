"use client";

import { useEffect } from "react";
import { useCartStore } from "@/lib/cart/store";

/**
 * Empties the cart once an order is actually placed.
 *
 * This lives on the success page rather than in the checkout form because
 * the Stripe flow leaves the site mid-checkout: clearing before the
 * redirect would wipe the cart of every customer who backs out of the
 * hosted page. By the time this renders, the order exists.
 *
 * The store uses `skipHydration`, so it has to be rehydrated before the
 * clear — otherwise we'd clear an empty in-memory store and leave the
 * persisted copy in localStorage untouched.
 */
export function ClearCart() {
  useEffect(() => {
    void useCartStore.persist.rehydrate();
    useCartStore.getState().clear();
  }, []);

  return null;
}
