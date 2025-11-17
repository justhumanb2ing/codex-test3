-- Schema definition for the record table used by the reading log feature.
drop table if exists public.record cascade;

create table public.record (
  id uuid primary key default gen_random_uuid(),
  user_id text not null default auth.jwt()->>'sub',
  book_title text not null,
  content text not null,
  user_keywords text[] not null default array[]::text[],
  created_at timestamptz not null default timezone('utc', now())
);

comment on table public.record is '독서 기록을 저장하는 테이블';
comment on column public.record.user_id is 'Clerk 사용자 ID';

create index record_user_created_at_idx
  on public.record (user_id, created_at desc);

alter table public.record enable row level security;

drop policy if exists "record_insert" on public.record;
drop policy if exists "record_select" on public.record;
drop policy if exists "record_update" on public.record;
drop policy if exists "record_delete" on public.record;

create policy "record_insert"
  on public.record
  for insert
  to authenticated
  with check (user_id = auth.jwt()->>'sub');

create policy "record_select"
  on public.record
  for select
  to public
  using (true);

create policy "record_update"
  on public.record
  for update
  to authenticated
  using (user_id = auth.jwt()->>'sub')
  with check (user_id = auth.jwt()->>'sub');

create policy "record_delete"
  on public.record
  for delete
  to authenticated
  using (user_id = auth.jwt()->>'sub');
