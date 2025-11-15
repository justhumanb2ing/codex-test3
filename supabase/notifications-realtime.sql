-- Supabase Realtime trigger setup for notifications table
-- Run this script once inside the Supabase SQL editor

begin;

-- Ensure table changes are fully replicated
alter table public.notifications replica identity full;

-- Register notifications table with the supabase_realtime publication
alter publication supabase_realtime add table public.notifications;

-- Trigger function that emits pg_notify payloads compatible with Supabase Realtime
create or replace function public.broadcast_notifications()
returns trigger
language plpgsql
security definer
as $$
declare
  record_data jsonb;
  payload jsonb;
begin
  if (TG_OP = 'DELETE') then
    record_data := to_jsonb(OLD);
  else
    record_data := to_jsonb(NEW);
  end if;

  payload := jsonb_build_object(
    'schema', TG_TABLE_SCHEMA,
    'table', TG_TABLE_NAME,
    'commit_timestamp', current_timestamp,
    'event', TG_OP,
    'new', case when TG_OP = 'DELETE' then null else to_jsonb(NEW) end,
    'old', case when TG_OP = 'DELETE' then to_jsonb(OLD) else null end
  );

  perform pg_notify(format('realtime:%s:%s', TG_TABLE_SCHEMA, TG_TABLE_NAME), payload::text);
  return null;
end;
$$;

drop trigger if exists broadcast_notifications_trigger on public.notifications;

create trigger broadcast_notifications_trigger
after insert or update or delete on public.notifications
for each row execute function public.broadcast_notifications();

commit;
