# 독서 그래프 데이터 파이프라인

`services/graph-extraction-service.ts`는 감상문을 분석해 `graph_nodes`, `graph_edges` 테이블을 채우는 서버 전용 파이프라인을 제공합니다. 분석기는 기본적으로 Gemini 2.5 Flash(`services/gemini-graph-analyzer.ts`)를 활용하지만 Provider 패턴으로 테스트 더블이나 다른 AI 모델을 자유롭게 교체할 수 있습니다.

## 동작 개요
1. `GraphAnalyzer`가 감상문, 책 제목, 사용자 키워드를 입력으로 받아 주제·감정·작가·장르·키워드·요약을 산출합니다.
2. 파이프라인은 결과를 `GraphNode` 페이로드로 변환하면서 `(user_id, node_type, label)` 조합을 기준으로 중복을 제거합니다. 동일 키워드가 사용자 입력/AI 분석 양쪽에서 등장하면 `metadata.sources`에 두 출처가 모두 기록됩니다.
3. Supabase `graph_nodes` 테이블에 upsert 후 반환된 노드 ID를 활용해 `GraphEdge` 페이로드를 생성합니다. 책 노드에서 다른 노드로만 엣지를 만들며, 주제/감정 노드에는 가중치(weight)를 반영합니다.
4. `graph_edges` 테이블까지 upsert가 완료되면 삽입된 노드/엣지 개수와 분석 결과가 호출자에게 반환됩니다.

## 사용법
```ts
import { createGraphExtractionService } from "@/services/graph-extraction-service"

const service = createGraphExtractionService()
await service.processRecord({
  recordId: "record-1",
  userId: "user-1",
  bookTitle: "데미안",
  content: "감상문 전문",
  userKeywords: ["자아", "성장"],
})
```

- 기본 분석기는 `GEMINI_API_KEY` 환경 변수를 읽어 Gemini 2.5 Flash를 호출합니다. 키가 없다면 서비스 초기화 단계에서 에러가 발생합니다.
- `createGraphExtractionService({ analyzer })` 혹은 `createGraphExtractionService({ analyzerProvider })` 형태로 다른 분석기를 주입해 자유롭게 교체할 수 있습니다.
- `processRecord`는 upsert된 노드/엣지 개수를 통해 파이프라인의 상태를 파악할 수 있게 합니다.
- 모든 노드는 `metadata` 필드를 통해 AI 요약, 감정 강도, 출처 정보 등 확장 데이터를 담습니다.

## 앱 연동 상태
- `services/reading-log-service.ts`의 `createReadingEntry`는 독서 기록이 저장된 직후 위 파이프라인을 자동으로 호출합니다. 사용자가 감상문을 작성해 게시하면 해당 기록 ID, 책 제목, 감상문, 사용자 키워드가 즉시 `processRecord`에 전달되어 그래프 노드/엣지가 생성됩니다.
- 그래프 분석이 실패하더라도 독서 기록 작성 흐름은 차단하지 않으며, 오류는 서버 로그에 남아 재시도나 장애 모니터링의 근거로 활용할 수 있습니다.

## 장애 처리
- 분석 단계 실패 → `success: false`와 에러 메시지를 즉시 반환하며 DB 호출은 진행하지 않습니다.
- 노드 또는 엣지 upsert 실패 → Supabase 에러 메시지를 그대로 전달하므로 호출 측에서 재시도/알람을 구현할 수 있습니다.
- 엣지를 생성할 수 없는 경우(예: 분석 결과 없음)에는 노드만 저장하고 `edgesInserted: 0`으로 응답합니다.
