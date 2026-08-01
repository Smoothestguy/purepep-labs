"use server";

import { revalidatePath } from "next/cache";
import { getAdminUser } from "@/lib/admin";
import { markOrderPaidManually } from "@/lib/orders";

export type MarkPaidState = { error?: string; ok?: boolean };

/**
 * Mark a manual (bank transfer / crypto) order as paid.
 *
 * Re-checks admin identity inside the action rather than trusting that the
 * page rendered for an admin — a Server Action is a public endpoint, and
 * anyone who can guess its id can invoke it.
 */
export async function markPaidAction(
  _prev: MarkPaidState,
  formData: FormData,
): Promise<MarkPaidState> {
  const admin = await getAdminUser();
  if (!admin) return { error: "Not authorised." };

  const orderRef = String(formData.get("orderRef") ?? "").trim();
  if (!orderRef) return { error: "Missing order reference." };

  const reference = String(formData.get("reference") ?? "").trim() || null;

  try {
    const result = await markOrderPaidManually({
      orderRef,
      reference,
      by: admin.email,
    });
    if (!result.ok) return { error: result.reason ?? "Could not update order." };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Could not update order.",
    };
  }

  revalidatePath("/admin/orders");
  return { ok: true };
}
