-- Stripe Checkout support.
--
-- Card payments no longer settle inside the checkout request the way the
-- NMI Direct Post sale did. The customer is redirected to a Stripe-hosted
-- page, so the order sits at 'pending' until the `checkout.session.completed`
-- webhook arrives — closer to the bank-transfer flow than to the old card
-- flow, even though the customer experiences it as an instant card payment.
--
-- That makes the session id the join key between our order and Stripe's
-- record of the payment, so it gets its own column and a unique index.

alter table public.orders
  add column if not exists stripe_session_id text;

alter table public.orders
  add column if not exists stripe_payment_intent text;

-- Unique, but only over non-null values: every manual and NMI order has a
-- null session id, and a plain unique constraint would let exactly one of
-- them exist. Partial index gives us idempotent webhook lookups without
-- constraining the rest of the table.
create unique index if not exists orders_stripe_session_id_key
  on public.orders (stripe_session_id)
  where stripe_session_id is not null;

create index if not exists orders_stripe_payment_intent_idx
  on public.orders (stripe_payment_intent)
  where stripe_payment_intent is not null;

-- Records a total that Stripe reported but that disagreed with what we
-- priced. Should always be null; if it is ever set, the order needs a
-- human before it ships.
alter table public.orders
  add column if not exists amount_mismatch_cents integer;
