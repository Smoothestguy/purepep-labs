-- Manual payment methods (bank transfer, crypto).
--
-- These settle out-of-band: the customer places the order, receives
-- instructions, and pays separately. The order sits at 'pending' until
-- someone confirms funds arrived and marks it paid — unlike a card sale,
-- which resolves inside the checkout request.

alter table public.orders
  add column if not exists payment_method text not null default 'card';

-- Drop-and-recreate so re-running the migration is safe.
alter table public.orders
  drop constraint if exists orders_payment_method_check;

alter table public.orders
  add constraint orders_payment_method_check
  check (payment_method in ('card', 'bank_transfer', 'crypto'));

-- Operator-entered reference once funds land: wire confirmation number,
-- crypto transaction hash, etc. Null until reconciled.
alter table public.orders
  add column if not exists payment_reference text;

-- Who marked it paid and when — manual state changes need an audit trail
-- in a way automated card settlement does not.
alter table public.orders
  add column if not exists marked_paid_by text;

alter table public.orders
  add column if not exists marked_paid_at timestamptz;

create index if not exists orders_payment_method_idx
  on public.orders (payment_method);

-- Pending manual orders are the operator's daily work queue.
create index if not exists orders_pending_manual_idx
  on public.orders (created_at desc)
  where status = 'pending' and payment_method <> 'card';
