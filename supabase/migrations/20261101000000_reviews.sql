-- Customer reviews. Anyone can submit (status = pending). Only approved reviews
-- are shown on the site. Written and read by server code using the service role.
create table if not exists public.reviews (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  status        text not null default 'pending' check (status in ('pending','approved','rejected')),
  display_name  text not null check (char_length(display_name) between 2 and 60),
  occasion      text not null,
  rating        smallint not null check (rating between 1 and 5),
  body          text not null check (char_length(body) between 20 and 1000),
  approved_at   timestamptz
);

create index if not exists reviews_status_idx on public.reviews (status, created_at desc);

alter table public.reviews enable row level security;
