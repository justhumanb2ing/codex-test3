# Profile Page

## 스크롤 구조
- `app/(protected)/profile/[userId]/page.tsx`의 루트는 `flex h-full flex-col overflow-hidden`을 사용해 레이아웃 스크롤과 분리합니다.
- 주요 콘텐츠는 `overflow-y-auto` 영역 내부에 위치해 페이지별로 스크롤이 발생하며, 상단 고정 헤더와 충돌하지 않습니다.
- 동일한 경험이 필요한 보호된 페이지는 같은 패턴(`flex h-full` + 내부 `overflow-y-auto`)을 재사용합니다.

## 탭 인터랙션
- `components/profile/profile-tabs.tsx`가 탭 UI를 전담하며 `Tabs` 값을 제어하여 인디케이터 위치를 계산합니다.
- `TabsList`는 하단에 얇은 보더를 가지고, 활성 탭 아래에는 `foreground` 색상 인디케이터가 `translateX` 애니메이션으로 이동해 자연스러운 이동감을 제공합니다.
- 비활성 탭은 `text-muted-foreground`, 활성 탭은 `text-foreground`를 사용하여 상태 대비를 유지합니다.
- 새 섹션이 필요하면 해당 컴포넌트 내에 `TabsContent`를 추가하고 동일한 스타일 규칙을 따른 후 필요한 경우 테스트(또는 스냅샷)를 보강합니다.
