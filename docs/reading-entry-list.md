# Reading Entry List

## 헤더 & 날짜 표기
- `components/reading/reading-entry-list.tsx` 는 각 항목 상단에 `사용자명 › 도서 제목` 구조를 사용합니다.
- 기본 사용자명은 `entry.userId`이지만 실제 도메인에서 확장 시 별칭을 전달하면 됩니다.
- 헤더 전체는 `flex` + `justify-between`으로 구성되어 오른쪽에 날짜가 위치합니다.
- 날짜는 `formatRelativeDate`를 통해 `"오늘"`, `n일 전`, 또는 `YYYY-MM-DD`(7일 이후) 포맷을 순차 적용합니다.

## 콘텐츠 표시
- 항목은 더 이상 `Link`로 감싸지지 않으며, 순수 카드 형태(`article`)로만 보여집니다.
- 본문 내용은 `whitespace-pre-line`으로 전체를 렌더링하므로 개행을 유지한 채 모두 확인할 수 있습니다.
- 키워드 태그는 기존과 동일하게 카드 하단에 렌더링됩니다.
