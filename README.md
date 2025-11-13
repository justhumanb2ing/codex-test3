## Overview

Supabase를 기반으로 로그인 · 로그아웃 · 회원가입 플로우를 구현한 Next.js(App Router) 예제입니다. 서버 액션과 SSR을 사용하여 최소한의 클라이언트 자바스크립트로 인증을 처리합니다. 추가로 독서 기록을 등록하면 AI 요약과 감정/주제 분석 결과를 함께 저장하고 확인할 수 있습니다.

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
| `NEXT_PUBLIC_SITE_URL` | OAuth 리다이렉트에 사용할 공개 사이트 URL |
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
| `services/` | Supabase 인증과 같은 데이터/도메인 로직 |
| `tests/` | 단위/통합 테스트 파일 (Bun test 실행 대상) |
| `types/` | JSON Schema 등 공용 타입 정의 |

## Auth Pages

- `/login` – 이메일/비밀번호 로그인과 Kakao OAuth 버튼, 서버 액션 기반 오류 처리
- `/signup` – 비밀번호 확인 + 이메일 검증 안내, Kakao OAuth 온보딩 옵션
- `/logout` – 로그아웃 서버 액션을 노출하는 확인 페이지
- `/auth/callback` – Kakao OAuth 리디렉션 후 세션을 확정하고 원하는 경로로 이동
- `/` – 현재 세션 정보를 SSR에서 렌더링하고 상태에 따라 CTA 제어

## JSON Schemas

`types/models` 디렉터리에는 Book, Emotion, Keyword, Achievement, ReadingEntry 엔터티를 JSON Schema로 정의하여 API 혹은 데이터베이스와의 계약을 문서화했습니다. Kakao OAuth와 같은 소셜 로그인을 추가로 붙일 때도 동일한 구조를 재사용할 수 있습니다.
