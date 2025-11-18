# Reading Entry Form

`components/reading/reading-entry-form.tsx`는 독서 기록 작성 모달 안에서 사용자의 입력 경험을 담당합니다. 아래 섹션은 UI 구조와 상호작용 방식을 설명합니다.

## 작성자 안내
- 폼 상단에는 `현재 로그인한 사용자명 > 책 추가` 형식의 안내 문구를 별도 컴포넌트로 노출합니다.
- `currentUserName` prop으로 전달된 이름을 사용하며, 값이 비어 있으면 `"사용자"`로 폴백합니다.
- 해당 안내 영역에는 `aria-label`이 적용되어 스크린 리더에서도 동일한 문구를 읽을 수 있습니다.

## 입력 필드
- **책 제목**: `components/ui/input`을 사용하여 작성합니다. 모든 테두리와 포커스 링을 제거하여 주변 UI와 자연스럽게 연결되며, 필요한 경우 `value/onChange`로 제어합니다.
- **감상문**: `components/ui/textarea`를 사용하며 자동으로 포커스를 받습니다. 마찬가지로 테두리가 없고 입력 영역만 확장됩니다.
- 키워드 입력 필드는 제거되었으며 서버 액션은 빈 배열을 기본값으로 처리합니다.

## 액션 처리
- `useActionState`를 통해 `createReadingEntryAction` 서버 액션과 연결하며, 전송 중 상태(`isPending`)에 따라 버튼 라벨이 `"등록 중..."`으로 변경됩니다.
- 제출 실패 시 반환된 에러 메시지를 경고 블록으로 표시하고, 성공 시 Next.js 리다이렉트가 실행됩니다.

## 통합 지침
- `ReadingEntryModal`이 `currentUserName`을 prop으로 전달하며, 페이지(`app/(protected)/reading/page.tsx`)에서는 Clerk 사용자 정보를 활용해 이름을 계산합니다.
- 내비게이션 시트에서도 동일한 prop을 사용하므로 사용자 이름이 항상 안내 문구에 반영됩니다.
