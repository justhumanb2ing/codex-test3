# Profile Sync

## 목표
- Clerk에서 인증된 사용자의 표시 이름과 아바타를 Supabase `profiles` 테이블에 보관합니다.
- 독서 기록 목록과 다른 UI는 `profiles` 데이터를 통해 일관된 사용자명을 사용할 수 있습니다.

## 동작 흐름
1. `services/profile-service.ts`  
   - `upsertProfileFromClerkUser`는 `AppUser` 정보를 받아 `profiles` 테이블에 `user_id`, `display_name`, `avatar_url`을 upsert 합니다.  
   - `getProfileByUserId`는 `user_id` 기준으로 `profiles` 레코드를 반환합니다.
2. `app/(protected)/reading/page.tsx`  
   - 리스트 페이지가 렌더링될 때 현재 Clerk 사용자 정보를 Supabase와 동기화한 뒤, 독서 기록을 조회합니다.
3. `services/reading-log-service.ts`  
   - `listReadingEntries`는 RLS 범위 내에서 `profiles` 데이터를 가져와 `ReadingEntry.authorName`/`authorAvatarUrl`에 주입합니다.
4. `components/reading/reading-entry-list.tsx`  
   - `authorName`을 우선 사용해 `사용자명 › 도서 제목` 구조를 출력합니다.

## 고려 사항
- Supabase `profiles` 테이블은 `user_id`를 PK로 사용하고 해당 사용자만 자신의 프로필을 upsert/read 할 수 있도록 RLS를 설정해야 합니다.
- Clerk 프로필 변경이 잦다면 Webhook을 사용해 Supabase를 사전에 동기화할 수 있고, 그렇지 않다면 현재 페이지 접근 시 upsert 해도 충분합니다.
- 추가 메타데이터(예: bio, social 링크)는 `profiles` 스키마를 확장하거나 별도 테이블을 둘 수 있습니다. UI는 `UserProfile` 타입을 확장해 새로운 필드를 소화하면 됩니다.
