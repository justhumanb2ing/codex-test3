-- Allow authenticated users to update the read status of their notifications.
-- Run inside the Supabase SQL editor.

begin;

alter table public.notifications enable row level security;

drop policy if exists "Users can update notification read state" on public.notifications;

create policy "Users can update notification read state"
  on public.notifications
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

commit;
