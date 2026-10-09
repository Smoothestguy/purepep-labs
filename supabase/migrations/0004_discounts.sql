-- Comp codes.
--
-- A comped order is settled without any processor involvement: there is
-- nothing to charge, so it never reaches Stripe. It still gets a full
-- order row, because fulfilment, lot traceability and the CoA paperwork
-- are identical whether or not money changed hands.
--
-- `discount_cents` is stored rather than inferred so the row stays
-- self-describing: total_cents = subtotal_cents + shipping_cents -
-- discount_cents, and a comped order reads as 0 without anyone having to
-- reverse-engineer why.

alter table public.orders
  add column if not exists discount_code text;

alter table public.orders
  add column if not exists discount_cents integer not null default 0;

alter table public.orders
  drop constraint if exists orders_discount_cents_check;

alter table public.orders
  add constraint orders_discount_cents_check
  check (discount_cents >= 0);

-- Comped orders are worth being able to pull up on their own — both to
-- audit who has been giving them out and to keep them out of revenue
-- figures.
create index if not exists orders_discount_code_idx
  on public.orders (discount_code)
  where discount_code is not null;
