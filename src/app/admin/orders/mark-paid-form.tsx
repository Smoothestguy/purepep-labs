"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { markPaidAction, type MarkPaidState } from "./actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="shrink-0 border border-brand bg-brand/10 font-mono uppercase tracking-[0.18em] text-brand transition-colors hover:bg-brand/20 disabled:opacity-50"
      style={{
        paddingInline: "clamp(0.7rem, 1vw, 0.9rem)",
        paddingBlock: "clamp(0.45rem, 0.7vw, 0.55rem)",
        fontSize: "clamp(9.5px, 0.25vw + 8.5px, 10.5px)",
      }}
    >
      {pending ? "Saving…" : "Mark paid"}
    </button>
  );
}

/**
 * Operator control for manual orders. The reference field records the wire
 * confirmation number or transaction hash so a payment can be traced back
 * to the order later — optional, because chasing it down shouldn't block
 * marking an order that has obviously landed.
 */
export function MarkPaidForm({ orderRef }: { orderRef: string }) {
  const [state, action] = useActionState<MarkPaidState, FormData>(
    markPaidAction,
    {},
  );

  return (
    <form
      action={action}
      className="mt-3 border-t border-hairline pt-3"
      style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
    >
      <input type="hidden" name="orderRef" value={orderRef} />
      <div className="flex flex-wrap items-center gap-2">
        <input
          name="reference"
          placeholder="Wire ref / tx hash (optional)"
          className="min-w-0 flex-1 border border-hairline bg-transparent font-mono text-foreground placeholder:text-muted-foreground/60 focus:border-brand focus:outline-none"
          style={{
            paddingInline: "clamp(0.6rem, 0.9vw, 0.8rem)",
            paddingBlock: "clamp(0.45rem, 0.7vw, 0.55rem)",
            fontSize: "clamp(10px, 0.28vw + 9px, 11px)",
          }}
        />
        <SubmitButton />
      </div>
      {state.error ? (
        <p
          className="font-mono text-heat"
          style={{ fontSize: "clamp(9.5px, 0.25vw + 8.5px, 10.5px)" }}
        >
          {state.error}
        </p>
      ) : null}
    </form>
  );
}
