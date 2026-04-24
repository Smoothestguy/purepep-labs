"use client";

import type { CollectJSConfig } from "./types";

/**
 * Client-only CollectJS loader.
 *
 * NMI's CollectJS drop-in expects a <script> tag with a
 * `data-tokenization-key` attribute on the page; the library then reads
 * that attribute and exposes `window.CollectJS`. We inject the tag once
 * per page load and memoise the promise so repeat calls are cheap.
 */

const SCRIPT_SRC =
  "https://secure.networkmerchants.com/token/Collect.js";

let loadPromise: Promise<void> | null = null;

export function loadCollectJS(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("CollectJS can only load in the browser."));
  }
  if (window.CollectJS) return Promise.resolve();
  if (loadPromise) return loadPromise;

  const tokenKey = process.env.NEXT_PUBLIC_NMI_TOKENIZATION_KEY;
  if (!tokenKey) {
    return Promise.reject(
      new Error(
        "NEXT_PUBLIC_NMI_TOKENIZATION_KEY is not set. Running in mock mode.",
      ),
    );
  }

  loadPromise = new Promise<void>((resolve, reject) => {
    // Guard against a stale <script> already on the page (e.g. from a
    // previous soft-navigation); reuse it if so.
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${SCRIPT_SRC}"]`,
    );
    const script = existing ?? document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    script.setAttribute("data-tokenization-key", tokenKey);

    script.addEventListener("load", () => {
      if (window.CollectJS) resolve();
      else reject(new Error("CollectJS loaded but window.CollectJS missing."));
    });
    script.addEventListener("error", () =>
      reject(new Error("Failed to load CollectJS script.")),
    );

    if (!existing) document.head.appendChild(script);
    // If the script was already present and had loaded synchronously
    // (cached), `load` won't fire again — check once eagerly.
    else if (window.CollectJS) resolve();
  });

  return loadPromise;
}

export function configureCollectJS(config: CollectJSConfig): void {
  if (typeof window === "undefined" || !window.CollectJS) {
    throw new Error("CollectJS is not loaded. Call loadCollectJS() first.");
  }
  window.CollectJS.configure(config);
}

export function startCollectJSPaymentRequest(): void {
  if (typeof window === "undefined" || !window.CollectJS) {
    throw new Error("CollectJS is not loaded. Call loadCollectJS() first.");
  }
  window.CollectJS.startPaymentRequest();
}
