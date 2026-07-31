import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAdminUser } from "@/lib/admin";
import { listOrders, type OrderRow, type OrderStatus } from "@/lib/orders";
import { formatCents } from "@/lib/pricing";

export const metadata: Metadata = {
  title: "Orders — The Pure Pep",
  robots: { index: false, follow: false },
};

// Always read fresh — an order list must never be served from cache.
export const dynamic = "force-dynamic";

const STATUS_STYLE: Record<OrderStatus, string> = {
  paid: "border-brand/40 bg-brand/10 text-brand",
  pending: "border-hairline bg-surface/60 text-muted-foreground",
  shipped: "border-brand/30 bg-brand/5 text-brand/80",
  failed: "border-heat/40 bg-heat/10 text-heat",
  cancelled: "border-hairline bg-surface/40 text-muted-foreground",
  refunded: "border-hairline bg-surface/40 text-muted-foreground",
};

function StatusChip({ status }: { status: OrderStatus }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center border px-2 py-1 font-mono uppercase tracking-[0.18em] ${
        STATUS_STYLE[status] ?? STATUS_STYLE.pending
      }`}
      style={{ fontSize: "clamp(9px, 0.25vw + 8px, 10px)" }}
    >
      {status}
    </span>
  );
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function OrderCard({ order }: { order: OrderRow }) {
  const items = Array.isArray(order.items) ? order.items : [];
  const shipping = order.shipping;

  return (
    <div
      className="border border-hairline bg-surface/30"
      style={{ padding: "clamp(1rem, 1.6vw, 1.35rem)" }}
    >
      {/* Row 1 — ref, status, total */}
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-2">
        <div className="flex items-center gap-3">
          <span
            className="font-mono tracking-[0.2em] text-foreground"
            style={{ fontSize: "clamp(11px, 0.3vw + 10px, 13px)" }}
          >
            {order.order_ref}
          </span>
          <StatusChip status={order.status} />
        </div>
        <span
          className="font-display leading-none text-foreground"
          style={{ fontSize: "clamp(1.25rem, 2.5vw, 1.6rem)" }}
        >
          ${formatCents(order.total_cents)}
        </span>
      </div>

      {/* Row 2 — who / when */}
      <div
        className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-muted-foreground"
        style={{ fontSize: "clamp(10px, 0.28vw + 9px, 11.5px)" }}
      >
        <span className="break-all">{order.email}</span>
        <span className="text-hairline">·</span>
        <span className="whitespace-nowrap">{formatDate(order.created_at)}</span>
      </div>

      {/* Line items */}
      <ul
        className="mt-3 border-t border-hairline pt-3 font-mono text-muted-foreground"
        style={{ fontSize: "clamp(10.5px, 0.28vw + 9.5px, 12px)" }}
      >
        {items.map((i, idx) => (
          <li
            key={`${i.slug}-${i.dose}-${idx}`}
            className="flex items-baseline justify-between gap-3 py-0.5"
          >
            <span className="min-w-0">
              <span className="text-foreground">{i.name}</span>{" "}
              <span className="text-muted-foreground">· {i.dose}</span>
              {i.quantity > 1 ? (
                <span className="text-brand"> ×{i.quantity}</span>
              ) : null}
            </span>
            <span className="shrink-0 tabular-nums">
              ${formatCents(i.line_total_cents)}
            </span>
          </li>
        ))}
      </ul>

      {/* Ship-to */}
      <div
        className="mt-3 border-t border-hairline pt-3 font-mono text-muted-foreground"
        style={{ fontSize: "clamp(10px, 0.28vw + 9px, 11.5px)" }}
      >
        <span className="uppercase tracking-[0.22em] text-muted-foreground/70">
          Ship to
        </span>{" "}
        <span className="text-foreground">
          {shipping?.firstName} {shipping?.lastName}
        </span>
        {shipping?.address1 ? (
          <span>
            {" "}
            — {shipping.address1}
            {shipping.address2 ? `, ${shipping.address2}` : ""}, {shipping.city}{" "}
            {shipping.state} {shipping.zip}
          </span>
        ) : null}
      </div>

      {order.status === "failed" && order.failure_reason ? (
        <p
          className="mt-2 font-mono text-heat"
          style={{ fontSize: "clamp(10px, 0.28vw + 9px, 11.5px)" }}
        >
          {order.failure_reason}
        </p>
      ) : null}
    </div>
  );
}

export default async function AdminOrdersPage() {
  const admin = await getAdminUser();
  // 404 rather than 403 — don't confirm the route exists to non-admins.
  if (!admin) notFound();

  let orders: OrderRow[] = [];
  let loadError: string | null = null;
  try {
    orders = await listOrders();
  } catch (err) {
    loadError = err instanceof Error ? err.message : String(err);
  }

  const paid = orders.filter((o) => o.status === "paid");
  const revenueCents = paid.reduce((sum, o) => sum + o.total_cents, 0);

  return (
    <section className="relative min-h-screen border-b border-hairline">
      <div
        className="mx-auto w-full max-w-[var(--content-max)] pad-x"
        style={{
          paddingTop: "clamp(3rem, 6vw, 6rem)",
          paddingBottom: "clamp(3rem, 5vw, 5rem)",
        }}
      >
        <div className="section-eyebrow">
          <span className="whitespace-nowrap text-brand">§ ADMIN</span>
          <span
            className="h-px shrink-0 bg-hairline"
            style={{ width: "clamp(1.5rem, 3vw, 2.75rem)" }}
          />
          <span>Orders</span>
        </div>

        <h1
          className="display-lg"
          style={{ marginTop: "clamp(0.85rem, 1.4vw, 1.25rem)" }}
        >
          Order book
        </h1>

        {/* Summary */}
        <div
          className="flex flex-wrap gap-x-8 gap-y-3 font-mono text-muted-foreground"
          style={{
            marginTop: "clamp(1.25rem, 2vw, 1.75rem)",
            fontSize: "clamp(10px, 0.28vw + 9px, 11.5px)",
          }}
        >
          <span>
            <span className="uppercase tracking-[0.22em]">Orders</span>{" "}
            <span className="text-foreground">{orders.length}</span>
          </span>
          <span>
            <span className="uppercase tracking-[0.22em]">Paid</span>{" "}
            <span className="text-foreground">{paid.length}</span>
          </span>
          <span>
            <span className="uppercase tracking-[0.22em]">Revenue</span>{" "}
            <span className="text-brand">${formatCents(revenueCents)}</span>
          </span>
        </div>

        {loadError ? (
          <div
            className="mt-8 border border-heat/40 bg-heat/10 font-mono text-heat"
            style={{
              padding: "clamp(1rem, 1.6vw, 1.4rem)",
              fontSize: "clamp(11px, 0.3vw + 10px, 12.5px)",
            }}
          >
            Could not load orders: {loadError}
          </div>
        ) : orders.length === 0 ? (
          <div
            className="mt-8 border border-hairline bg-surface/30 font-mono text-muted-foreground"
            style={{
              padding: "clamp(1.5rem, 3vw, 2.5rem)",
              fontSize: "clamp(11px, 0.3vw + 10px, 12.5px)",
            }}
          >
            No orders yet.
          </div>
        ) : (
          <div
            className="grid grid-cols-1"
            style={{
              marginTop: "clamp(1.75rem, 3vw, 2.5rem)",
              gap: "clamp(0.75rem, 1.2vw, 1rem)",
            }}
          >
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
