"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Square sends the customer back the moment they pay, usually a second or
 * two before its webhook tells us the payment settled. Rather than leave
 * them on "confirming", re-render the page every few seconds until the
 * order flips to paid — for about a minute, then stop.
 */
export function RefreshWhilePending() {
  const router = useRouter();

  useEffect(() => {
    let tries = 0;
    const id = window.setInterval(() => {
      tries += 1;
      router.refresh();
      if (tries >= 20) window.clearInterval(id);
    }, 3000);
    return () => window.clearInterval(id);
  }, [router]);

  return null;
}
