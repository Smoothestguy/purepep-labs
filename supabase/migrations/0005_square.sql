-- Square hosted checkout.
--
-- Square is the third processor this table has carried (NMI, Stripe, now
-- Square), so the columns stay processor-specific rather than being
-- reused: a Stripe order and a Square order have to remain tellable apart
-- long after the fact, for refunds, disputes and reconciliation.
--
-- `square_order_id` is the join key. It comes back when the payment link
-- is created, before the customer has paid, and the payment webhook
-- carries it — so it is what links a completed payment to our order.

alter table public.orders
  add column if not exists square_order_id text;

alter table public.orders
  add column if not exists square_payment_id text;

-- Unique over non-null values only: every Stripe, NMI and manual order
-- has a null here, and a plain unique constraint would allow exactly one
-- of them to exist.
create unique index if not exists orders_square_order_id_key
  on public.orders (square_order_id)
  where square_order_id is not null;

create index if not exists orders_square_payment_id_idx
  on public.orders (square_payment_id)
  where square_payment_id is not null;
