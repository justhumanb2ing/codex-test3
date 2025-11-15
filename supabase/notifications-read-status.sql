-- Notifications table read status support
-- Run inside Supabase SQL editor.

begin;

alter table public.notifications
  add column if not exists read_at timestamptz default null,
  add column if not exists is_read boolean default false;

create index if not exists notifications_user_read_idx
  on public.notifications (user_id, is_read, read_at);

commit;
