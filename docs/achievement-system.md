# Achievement/Badge 단일 시스템 설계

## 목표
- 업적과 배지를 하나의 개념으로 통합합니다. (편의상 “배지”라 부르지만 업적 조건·이미지·설명을 모두 포함합니다.)
- 사용자는 프로필 페이지에서 달성 여부와 관계없이 모든 배지를 확인할 수 있습니다.
- 실시간(Realtime)으로 배지 획득 알림을 받아 토스트 및 UI를 갱신합니다.
- 서버/데이터 계층은 append-only 구조로 구성하고, RLS/트리거를 통해 수정·삭제를 차단합니다.

## 테이블 개요

| 테이블 | 목적 | 주요 필드 |
| --- | --- | --- |
| `achievements` | 배지(=업적) 정의 | `code`, `title`, `description`, `image_url`, `rule` |
| `user_achievements` | 사용자가 얻은 배지 기록 | `user_id`, `achievement_id`, `awarded_at`, `context` |
| `achievement_action_log` | 사용자 행동 로그 | `user_id`, `action_code`, `payload`, `recorded_at` |

### `achievements`
```text
id uuid PK
code text UNIQUE
title text NOT NULL
description text
image_url text
rule jsonb (조건 정의)
is_active boolean DEFAULT true
created_at timestamptz DEFAULT now()
```

### `user_achievements`
```text
id uuid PK
user_id text NOT NULL
achievement_id uuid NOT NULL REFERENCES achievements(id)
awarded_at timestamptz DEFAULT now()
context jsonb
UNIQUE(user_id, achievement_id)
```

### `achievement_action_log`
```text
id uuid PK
user_id text NOT NULL
action_code text NOT NULL
payload jsonb
recorded_at timestamptz DEFAULT now()
```

## Supabase SQL 스크립트
기존 객체를 모두 삭제하고 단일 배지 설계를 적용하려면 아래 스크립트를 SQL Editor에서 실행하세요.

```sql
-- 0) 기존 객체 제거
drop trigger if exists user_badges_block_ud on public.user_badges;
drop trigger if exists achievement_action_block_ud on public.achievement_action_log;
drop trigger if exists user_achievements_block_ud on public.user_achievements;
drop function if exists public.block_ud_operations() cascade;
drop function if exists public.grant_achievement_from_action(text, text, jsonb);
drop table if exists public.user_achievements cascade;
drop table if exists public.user_badges cascade;
drop table if exists public.achievement_catalog cascade;
drop table if exists public.badge_catalog cascade;

-- 1) 신규 테이블
create table public.badges (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  title text not null,
  description text,
  image_url text,
  threshold jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.achievement_action_log (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  action_code text not null,
  payload jsonb,
  recorded_at timestamptz not null default now()
);
create index achievement_action_log_user_idx
  on public.achievement_action_log (user_id, action_code);

create table public.user_badges (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  badge_id uuid not null references public.badges(id),
  awarded_at timestamptz not null default now(),
  source_event_id uuid references public.achievement_action_log(id),
  context jsonb,
  unique (user_id, badge_id)
);
create index user_badges_user_idx on public.user_badges (user_id);

-- 2) RLS
alter table public.badges enable row level security;
alter table public.achievement_action_log enable row level security;
alter table public.user_badges enable row level security;

create policy badges_crud on public.badges for all using (true) with check (true);
create policy action_log_select_all on public.achievement_action_log
  for select using (true);
create policy action_log_insert_self on public.achievement_action_log
  for insert with check (auth.uid()::text = user_id);
create policy user_badges_select_all on public.user_badges
  for select using (true);
create policy user_badges_insert_self on public.user_badges
  for insert with check (auth.uid()::text = user_id);

-- 3) RPC
create or replace function public.grant_achievement_from_action(
  p_user_id text,
  p_action_code text,
  p_payload jsonb default '{}'::jsonb
)
returns table (
  result_badge_id uuid,
  result_badge_title text,
  result_badge_image_url text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  inserted_action_id uuid;
begin
  insert into public.achievement_action_log (user_id, action_code, payload)
    values (p_user_id, p_action_code, p_payload)
    returning id into inserted_action_id;

  return query
  with candidate_badges as (
    select b.id, b.title, b.image_url
    from public.badges b
    where b.is_active = true
      and b.code = p_action_code
  ),
  inserted_badges as (
    insert into public.user_badges (
      user_id, badge_id, awarded_at, source_event_id, context
    )
    select p_user_id, cb.id, now(), inserted_action_id, p_payload
    from candidate_badges cb
    on conflict (user_id, badge_id) do nothing
    returning badge_id
  )
  select
    cb.id,
    cb.title,
    cb.image_url
  from candidate_badges cb
  where cb.id in (select badge_id from inserted_badges);

  return;
end;
$$;

-- 4) Realtime publication
alter publication supabase_realtime add table
  public.user_badges;

-- 5) Update/Delete 차단 트리거 (선택)
create or replace function public.block_ud_operations()
returns trigger as $$
begin
  raise exception 'This table is append-only.';
end;
$$ language plpgsql;

create trigger user_badges_block_ud
  before update or delete on public.user_badges
  for each statement execute function public.block_ud_operations();

create trigger achievement_action_block_ud
  before update or delete on public.achievement_action_log
  for each statement execute function public.block_ud_operations();
```

## 데이터 흐름
1. 앱이 사용자 행동을 기록하면 `grant_achievement_from_action` RPC를 호출합니다.
2. RPC는 `achievement_action_log`에 이벤트를 기록한 뒤, 조건에 맞는 배지를 `user_badges`에 삽입합니다(`on conflict do nothing`).
3. `user_badges` INSERT 이벤트가 Realtime 채널(`achievements-user-<user_id>`)로 전송됩니다.
4. 프론트엔드는 RPC 응답/Realtime 이벤트 모두에서 토스트를 띄우고, 프로필 페이지 데이터를 갱신합니다.

## 프론트 요구 사항
- 홈 `/` 페이지의 `AchievementTester` 컴포넌트에서 RPC/Realtime 흐름을 테스트합니다.
- 프로필 페이지(`ProfileTabs`)는 `getProfileAchievements` 결과를 받아 모든 배지를 렌더링하며, 잠금 여부를 UI로 표시합니다.
- 토스트(`components/ui/toast.tsx`)는 배지 이미지를 함께 노출하고, “프로필로 이동” 액션 버튼을 제공합니다.

## 서버 자동화
- 독서 기록 생성 액션(`createReadingEntryAction`) 완료 후 `processReadingEntryAchievements`가 호출되어 사용자의 독서 횟수를 기준으로 배지 조건을 평가합니다.
- 배지의 `threshold.reading_count`가 만족되면 서버에서 `grant_achievement_from_action` RPC를 실행해 `user_badges`에 레코드를 추가하고, 클라이언트는 Realtime을 통해 토스트를 수신합니다.

## 더미 데이터 예시
```json
{
  "badges": [
    {
      "id": "1e0f7c52-1ed4-4bae-8a5c-9836cc72e001",
      "code": "first-log",
      "title": "첫 기록",
      "description": "첫 독서 기록을 작성했습니다.",
      "image_url": "/next.svg",
      "threshold": { "reading_count": 1 },
      "is_active": true
    },
    {
      "id": "4c3b3b4f-3d54-40d0-a6fd-22a1bb49a002",
      "code": "weekly-streak",
      "title": "일주일 연속",
      "description": "7일 연속 기록했습니다.",
      "image_url": "/window.svg",
      "threshold": { "streak_days": 7 },
      "is_active": true
    }
  ],
  "user_badges": [
    {
      "id": "a4cbb8cc-1927-4bb9-9f27-23a4b323a900",
      "user_id": "3eb73a36-d4d6-4b8e-9dde-3ddd79351601",
      "badge_id": "1e0f7c52-1ed4-4bae-8a5c-9836cc72e001",
      "awarded_at": "2024-06-01T09:10:00Z",
      "source_event_id": "dde93d76-4dfc-4d0f-8cfe-83e5c5335a01",
      "context": { "reading_entry_id": "221a197c-cf31-4a39-9d3d-57360daedc01" }
    }
  ]
}
```

## 토스트/프론트 UX 요약
- RPC 응답 및 Realtime 이벤트에서 `toastManager.add`를 호출합니다.
- 토스트 `data.imageUrl`에 배지 이미지를 전달하고, 액션 버튼으로 `/profile/<userId>`로 이동시킵니다.
- 프로필 페이지에서 `getProfileAchievements`로 받은 데이터를 기반으로 전체 배지를 노출합니다.
