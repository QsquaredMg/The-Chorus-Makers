-- Song samples: audio files the admin uploads and publishes on the site.
-- Audio lives in a public storage bucket. Rows are readable only through the
-- server (service role), and only when published.

create table if not exists public.song_samples (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 80),
  occasion text not null,
  style text not null default '' check (char_length(style) <= 60),
  description text not null default '' check (char_length(description) <= 300),
  storage_path text not null unique,
  position integer not null default 0,
  published boolean not null default false,
  permission_confirmed boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.song_samples enable row level security;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'song-samples',
  'song-samples',
  true,
  15728640,
  array['audio/mpeg', 'audio/mp4', 'audio/x-m4a', 'audio/wav', 'audio/x-wav', 'audio/aac', 'audio/ogg']
)
on conflict (id) do nothing;

-- Testimonials added by the admin. Recorded so there is a record that the
-- customer gave permission to publish their words.
alter table public.reviews add column if not exists permission_confirmed boolean not null default false;
