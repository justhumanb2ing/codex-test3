-- Schema definition for the reading_entries table used by the reading log feature.
create table if not exists public.reading_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  book_title text not null,
  content text not null,
  user_keywords text[] not null default array[]::text[],
  ai_summary text not null,
  ai_emotions jsonb not null check (jsonb_typeof(ai_emotions) = 'array'),
  ai_topics jsonb not null check (jsonb_typeof(ai_topics) = 'array'),
  created_at timestamptz not null default timezone('utc', now())
);

comment on table public.reading_entries is '독서 기록 및 AI 분석 결과를 저장하는 테이블';
comment on column public.reading_entries.user_id is '작성한 사용자 식별자';
comment on column public.reading_entries.user_keywords is '사용자가 직접 입력한 키워드 목록';
comment on column public.reading_entries.ai_emotions is 'AI 감정 분석 결과(JSON 배열)';
comment on column public.reading_entries.ai_topics is 'AI 주제 분석 결과(JSON 배열)';

create index if not exists reading_entries_user_created_at_idx
  on public.reading_entries (user_id, created_at desc);

alter table public.reading_entries enable row level security;

create policy if not exists "Users can insert their reading entries"
  on public.reading_entries for insert
  with check (auth.uid() = user_id);

create policy if not exists "Users can read their reading entries"
  on public.reading_entries for select
  using (auth.uid() = user_id);

create policy if not exists "Users can delete their reading entries"
  on public.reading_entries for delete
  using (auth.uid() = user_id);
