-- Orders for The Chorus Makers.
-- Written only by server code using the service role key. RLS is on with no
-- public policies, so the anon key cannot read or write orders.

create table if not exists public.orders (
  id                    uuid primary key default gen_random_uuid(),
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),

  status                text not null default 'pending_payment'
    check (status in ('pending_payment','paid','queued','drafting','generating','ready_for_review',
                      'approved','delivered','revision_requested','revising','complete',
                      'failed','refunded','abandoned')),

  tier                  text not null check (tier in ('classic','premium','rush')),
  amount_cents          integer not null check (amount_cents > 0),
  amount_paid_cents     integer,

  occasion              text not null,
  mood                  text not null,
  customer_name         text not null,
  customer_email        text not null,
  recipient_name        text not null,
  story                 text not null check (char_length(story) between 20 and 2000),

  consent_version       text not null,
  consent_text          text not null,
  consent_at            timestamptz not null,

  stripe_session_id     text unique,
  stripe_payment_intent text,
  paid_at               timestamptz
);

create index if not exists orders_status_idx on public.orders (status, created_at);
create index if not exists orders_email_idx on public.orders (customer_email);

alter table public.orders enable row level security;

create or replace function public.touch_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists orders_touch_updated_at on public.orders;
create trigger orders_touch_updated_at before update on public.orders
for each row execute function public.touch_updated_at();
