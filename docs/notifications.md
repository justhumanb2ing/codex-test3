# 알림 시스템 설계

## 개요

- **목적**: Supabase와 PWA(Service Worker + Push/Notification API)를 결합하여 신규 알림을 실시간으로 전송하고, 오프라인에서도 확인 가능한 사용자 경험 제공.
- **핵심 컴포넌트**
  - Supabase `notifications` 테이블
  - Supabase Realtime 채널 (Postgres Changes)
  - PWA 서비스워커(`/sw.js`)와 `NotificationProvider`
  - 테스트용 API(`POST /api/notifications/test`) 및 UI(`NotificationTester`)

## 데이터 모델

```sql
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete cascade,
  title text not null,
  body text,
  action_url text,
  created_at timestamptz default now() not null
);
```

- **user_id**: 대상 사용자. MVP에서는 선택적으로 null 허용 가능하며, 클라이언트에서 필터링.
- **title/body**: 알림 내용.
- **action_url**: 알림 클릭 시 이동할 경로.
- **Realtime 트리거**: `supabase/notifications-realtime.sql`을 통해 `supabase_realtime` 퍼블리케이션 등록 및 `broadcast_notifications` 트리거 생성.

## 동작 흐름

1. 서버/백오피스/테스트 API에서 `notifications` 테이블에 행을 삽입.
2. Supabase Realtime이 `INSERT` 이벤트를 브라우저에 전달.
3. `NotificationProvider`가 이벤트를 받아 Notification API를 호출.
4. 서비스워커가 메시지를 받아 백그라운드에서도 알림을 표시.
5. 사용자는 알림을 클릭하여 `action_url`로 이동.

### 시퀀스 요약

```
API → Supabase DB → Realtime Channel → NotificationProvider → Service Worker → Notification UI
```

## PWA 연계

- `public/manifest.json`: 앱 메타데이터 및 아이콘 정의.
- `public/sw.js`: Cache-first 전략 + 메시지 기반 알림 표시. `message` 이벤트에 `SHOW_NOTIFICATION` payload가 오면 `registration.showNotification` 실행.
- `components/pwa/pwa-provider.tsx`: 서비스워커 자동 등록.
- `components/pwa/notification-provider.tsx`:
  - 브라우저용 Supabase 클라이언트 구독.
  - Notification 권한 요청/체크.
  - 권한 허용 시 서비스워커/Notification API로 전달.
- Supabase SQL Editor에서 `supabase/notifications-realtime.sql`을 실행해 테이블이 Realtime 이벤트를 발행하도록 합니다.

## API 및 테스트

- **API**: `POST /api/notifications/test`
  - Body: `{ title: string, body?: string, actionUrl?: string }`
  - 서버에서 Supabase Server Client로 `notifications` INSERT 후 결과 반환.
- **테스트 UI**: `NotificationTester` (홈 `/`에 배치)
  - 입력 폼으로 제목/내용 지정 → API 호출 → 실시간 알림 확인.

## 권한 및 폴리시

- Supabase RLS 예시:
  ```sql
  alter table public.notifications enable row level security;
  create policy "Users can see their notifications"
    on public.notifications for select
    using (auth.uid() = user_id or user_id is null);
  create policy "Service can insert notifications"
    on public.notifications for insert
    with check (true); -- 필요 시 서비스 로직으로 제한
  ```
- 클라이언트에서 `Notification.requestPermission()`으로 권한 요청.

## 향후 확장

- Supabase 에지 함수/cron으로 배치 알림 발송.
- Topic/Tag 기반 구독, 우선순위 필드 추가.
- 알림 읽음/아카이브 상태를 위한 `read_at` 컬럼 추가.
