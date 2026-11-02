-- Admin fields for orders. The admin site reads and writes these through
-- server routes using the service role key.
alter table public.orders
  add column if not exists admin_notes text,
  add column if not exists delivery_url text,
  add column if not exists delivered_at timestamptz,
  add column if not exists client_notified_at timestamptz;

alter table public.orders drop constraint if exists orders_status_check;
alter table public.orders add constraint orders_status_check check (status in (
  'pending_payment','paid','queued','drafting','generating','ready_for_review',
  'approved','delivered','revision_requested','revising','complete',
  'failed','refunded','abandoned'));
