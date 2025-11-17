## Overview

Supabase를 데이터 계층으로, Clerk를 인증 계층으로 사용하는 Next.js(App Router) 예제입니다. Clerk의 호스티드 SignIn/SignUp UI를 통해 최소한의 클라이언트 코드로 인증을 처리하고, Supabase는 서비스 롤 키를 사용해 독서 기록/프로필 데이터를 저장합니다. 추가로 독서 기록을 등록하면 AI 요약과 감정/주제 분석 결과를 함께 저장하고 확인할 수 있습니다.

## Getting Started

1. 의존성 설치

```bash
bun install
```

2. 환경 변수 설정

```bash
cp .env.example .env.local
# .env.local 파일에 본인의 Supabase URL과 anon key를 입력하세요.
```

| 변수 | 설명 |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon API key |
| `SUPABASE_SERVICE_ROLE_KEY` | 서버에서 Supabase RLS를 우회해 데이터를 다룰 때 사용할 Service Role 키 |
| `NEXT_PUBLIC_SITE_URL` | OAuth 리다이렉트에 사용할 공개 사이트 URL |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk Publishable Key |
| `CLERK_SECRET_KEY` | Clerk Secret Key |
| `CLERK_SUPABASE_TEMPLATE_NAME` | Clerk JWT Template 이름(기본값 `supabase`) |
| `R2_ENDPOINT` | Cloudflare R2 S3 호환 엔드포인트 URL |
| `R2_ACCESS_KEY_ID` | R2 액세스 키 |
| `R2_SECRET_ACCESS_KEY` | R2 시크릿 키 |
| `R2_BUCKET_NAME` | 프로필 이미지를 저장할 R2 버킷명 |
| `R2_PUBLIC_BASE_URL` | 업로드된 객체를 접근할 수 있는 퍼블릭 베이스 URL(예: CDN 도메인) |
| `KAKAO_REST_API_KEY` | 카카오 도서 검색 API 호출에 사용할 REST API 키 |

3. 개발 서버 실행

```bash
bun dev
```

4. 테스트 실행

```bash
bun test
```

## Folder Structure

| 폴더 | 설명 |
| --- | --- |
| `app/` | Next.js App Router 경로와 서버 액션 |
| `components/` | 재사용 가능한 UI 및 Auth 컴포넌트 |
| `components/ui/` | shadcn/ui 기반 버튼 등 UI 프리미티브 |
| `config/` | Supabase와 같은 공용 설정 모듈 |
| `lib/` | 검색 파라미터 등 공유 유틸리티 |
| `services/` | Supabase 데이터 로직 및 Clerk 사용자 조회 |
| `tests/` | 단위/통합 테스트 파일 (Bun test 실행 대상) |
| `types/` | JSON Schema 등 공용 타입 정의 |

## Auth Pages

- `/sign-in` – Clerk SignIn 위젯(`app/(auth)/sign-in/[[...sign-in]]`)을 감싼 커스텀 카드
- `/sign-up` – Clerk SignUp 위젯(`app/(auth)/sign-up/[[...sign-up]]`)을 감싼 커스텀 카드
- `/` – 현재 Clerk 세션을 기반으로 SSR에서 CTA를 제어

## Username Policy

- Clerk 대시보드에서 Username 필드를 필수로 설정하면 동일한 정책이 모든 회원가입 경로에 적용됩니다.
- 사용자 이름은 Clerk가 관리하며, 필요한 경우 `profiles` 테이블에 저장된 사용자 정의 이름(풀네임/아바타)을 통해 UI를 커스터마이즈합니다.

## JSON Schemas

`types/models` 디렉터리에는 Book, Emotion, Keyword, Achievement, ReadingEntry 엔터티를 JSON Schema로 정의하여 API 혹은 데이터베이스와의 계약을 문서화했습니다. Kakao OAuth와 같은 소셜 로그인을 추가로 붙일 때도 동일한 구조를 재사용할 수 있습니다.
