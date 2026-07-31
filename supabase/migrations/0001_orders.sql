-- Orders storage.
--
-- Money is stored in integer cents, never floats — 39.99 * 3 in floating
-- point is not 119.97, and order totals must reconcile exactly.
--
-- `items` and `shipping` are JSONB snapshots taken at purchase time. They
-- are deliberately denormalised: if a price or product name changes in the
-- catalog later, historical orders must still show what the customer
-- actually agreed to pay.

create extension if not exists "pgcrypto";

create table if not exists public.orders (
  id                uuid primary key default gen_random_uuid(),

  -- Human-facing reference shown to the customer (e.g. "PP-MG8T2K").
  order_ref         text not null unique,

  -- Null for guest checkout; set when a logged-in user places the order.
  user_id           uuid references auth.users (id) on delete set null,
  email             text not null,

  status            text not null default 'pending'
                    check (status in (
                      'pending', 'paid', 'failed',
                      'shipped', 'cancelled', 'refunded'
                    )),

  -- [{ slug, accession, name, dose, unit_price_cents, quantity }]
  items             jsonb not null,
  shipping          jsonb not null,

  subtotal_cents    integer not null check (subtotal_cents >= 0),
  shipping_cents    integer not null check (shipping_cents >= 0),
  total_cents       integer not null check (total_cents >= 0),

  -- Gateway bookkeeping. `gateway_response` holds the parsed processor
  -- reply for dispute/debugging purposes. Never store PAN or CVV — we
  -- only ever hold a one-time CollectJS token, which is useless at rest.
  gateway           text,
  gateway_txn_id    text,
  gateway_auth_code text,
  gateway_response  jsonb,
  failure_reason    text,

  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists orders_created_at_idx on public.orders (created_at desc);
create index if not exists orders_user_id_idx    on public.orders (user_id);
create index if not exists orders_email_idx      on public.orders (lower(email));
create index if not exists orders_status_idx     on public.orders (status);

-- Keep updated_at honest.
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists orders_touch_updated_at on public.orders;
create trigger orders_touch_updated_at
  before update on public.orders
  for each row execute function public.touch_updated_at();

-- Row Level Security.
--
-- Deliberately restrictive: a signed-in customer may read their own orders
-- and nothing else. There is no INSERT/UPDATE policy at all, because writes
-- only ever happen server-side through the service-role key (which bypasses
-- RLS). That means a stolen anon key cannot forge or mutate an order.
alter table public.orders enable row level security;

drop policy if exists "orders_select_own" on public.orders;
create policy "orders_select_own"
  on public.orders
  for select
  using (auth.uid() = user_id);
