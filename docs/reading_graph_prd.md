---
title: "독서 히스토리 그래프 뷰 PRD (Product Requirement Document)"
---

# 독서 히스토리 그래프 뷰 PRD
사용자의 독서 기록을 기반으로 **의미 기반 그래프(Meaning Graph)**를 생성하여, 독서 패턴·성향·감정을 시각적으로 탐색할 수 있는 기능을 제공하는 것을 목표로 한다. 이 문서는 해당 기능을 설계·구현하기 위한 명확한 요구사항을 정의한다.

---

# 1. 제품 개요 (Product Overview)
## 1.1 기능 설명
"독서 히스토리 그래프 뷰"는 사용자가 기록한 감상문과 AI 분석 데이터(주제/감정/키워드)를 기반으로 책(Book)과 의미 요소(Topic/Emotion/Author/Genre)를 그래프 형태로 시각화한다. 이를 통해 사용자의 독서 성향을 한눈에 파악하고, 취향 기반 탐색 및 추천 기능을 강화한다.

## 1.2 문제 정의
사용자는 단순한 기록 형태로는 자신의 독서 패턴을 파악하기 어렵다. 또한 감정·주제 등 추상적인 요소는 리스트 UI로는 구조적 관계를 이해하기 어렵다. 이를 해결하기 위해 **관계 기반 시각화**가 필요하다.

## 1.3 목표 요약
- 독서 데이터를 구조화하여 의미 기반 그래프를 자동 생성한다.
- 사용자가 자신의 독서 패턴을 시각적으로 이해할 수 있게 한다.
- 주제·감정 기반 탐색 및 추천의 기반을 마련한다.

---

# 2. 목표 (Goals)
## Goal 1. 사용자의 독서 성향을 직관적으로 시각화
### Why
- 책, 감정, 주제, 작가 간의 연결을 시각적으로 보여야 트렌드·중심성·클러스터 파악이 가능하다.

### How
- record → AI 분석 → graph_nodes + graph_edges → 시각화 라이브러리로 렌더링
- 노드 타입(Book/Topic/Emotion/Author/Genre/Keyword)별 스타일 구분
- 강한 연결(예: 자주 등장하는 감정/주제) 중심으로 클러스터 표시

---

## Goal 2. 의미 기반 탐색 경험 제공
### Why
- 독서 기록은 리스트 UI만으로는 “통찰”을 제공하기 어렵다.
- 그래프의 연결 구조는 새로운 탐색 경험을 제공한다.

### How
- 노드 클릭 시 상세 정보 패널 표시(Book 정보, 감정 분석, 키워드 등)
- 필터링: 감정/주제/기간/작가별 보기
- 중심성(Centrality) 높은 노드를 하이라이트

---

## Goal 3. 추천 기능의 기반 데이터 구축
### Why
- 그래프는 추천 알고리즘(유사도·클러스터링 등)에 매우 적합한 구조다.

### How
- 노드·엣지 데이터를 기반으로 similarity graph 생성
- 감정 기반 추천(Emotion-similarity)
- 주제 기반 추천(Topic clustering)
- 시간 기반 변화(Temporal pattern) 분석 가능하도록 메타데이터 구조화

---

# 3. 주요 기능 요구사항 (Functional Requirements)
## 3.1 데이터 처리 요구사항
### FR-1. 독서 기록 분석
- record 테이블의 content를 기반으로 AI가 다음을 생성해야 한다:
  - topics (list)
  - emotions (list)
  - ai_summary (optional)
  - user_keywords는 사용자 입력 기반

### FR-2. 그래프 데이터 생성
- 분석 결과를 기반으로 다음 노드를 생성한다:
  - Book
  - Topic
  - Emotion
  - Author
  - Genre
  - Keyword

- 노드 간 관계(edge)를 자동 생성한다:
  - Book → Topic
  - Book → Emotion
  - Book → Author
  - Book → Genre
  - Book → Keyword

### FR-3. 그래프 저장 구조
- graph_nodes: 모든 노드를 단일 구조로 저장
- graph_edges: 노드 간 연결 관계 저장
- edge_type을 통해 관계 의미 명확화

---

## 3.2 시각화 요구사항
### FR-4. 그래프 렌더링
- Cytoscape.js 또는 vis-network 기반 시각화
- 노드 타입별 색상 및 크기 차별화
- 인터랙션(Zoom, Pan, Drag) 지원

### FR-5. 정보 노출
- 노드 클릭 시 관련 메타데이터 표시
- 책(Book) 노드 클릭 → AI summary, 감정, 주제, 키워드 표시

### FR-6. 필터링
- 감정별 필터
- 주제별 필터
- 시간(created_at) 기반 필터
- Book-only View / Topic-only View 제공

---

## 3.3 시스템 요구사항
### FR-7. 퍼포먼스
- 노드 수가 많아져도 UI가 버벅이지 않도록 WebGL 기반 또는 canvas 기반 라이브러리 사용
- 그래프 데이터는 SSR이 아닌 CSR로 불러오며, 필요한 범위만 lazy load

### FR-8. 확장성
- metadata(jsonb)를 활용해 노드 타입별 필드를 자유롭게 확장 가능해야 함

---

# 4. 비기능 요구사항 (Non-Functional Requirements)
## NFR-1. 일관성
- node_type에 따라 색상·형태·인터랙션 규칙을 일관되게 적용

## NFR-2. 확장성
- record 테이블은 변경하지 않고 graph_nodes, graph_edges를 통해 의미망 확장

## NFR-3. 안정성
- 잘못된 AI 분석 결과가 있어도 그래프가 깨지지 않도록 에러 핸들링

## NFR-4. 성능
- 그래프 노드·엣지 데이터는 API 호출 시 최소한의 데이터만 전송

---

# 5. 데이터 모델 (Data Model)
## 5.1 graph_nodes
- id: uuid
- user_id: uuid
- node_type: text(book/topic/emotion/author/genre/keyword)
- label: text
- metadata: jsonb
- created_at: timestamptz

## 5.2 graph_edges
- id: uuid
- user_id: uuid
- source: uuid(graph_nodes.id)
- target: uuid(graph_nodes.id)
- edge_type: text
- weight: float
- created_at: timestamptz

## 5.3 record (원본 데이터)
- 변경 없음
- 원본 감상문 및 사용자 입력 키워드만 저장

---

# 6. 유저 플로우 (User Flow)
```
1. 사용자가 감상 작성
2. record 테이블에 저장
3. AI 분석 수행
4. 그래프 노드/엣지 자동 생성
5. 프론트엔드에서 그래프 JSON 요청
6. 그래프 뷰 렌더링
7. 사용자가 노드 탐색/필터/추천 이용
```

---

# 7. 성공 지표 (Success Metrics)
- 그래프 뷰 진입률
- 그래프 내 노드 클릭률
- 감정/주제 기반 탐색 사용 빈도
- 추천 기능 클릭률(추후 적용)
- 사용자 리텐션 증가율

---

# 8. 향후 확장 방향 (Future Possibilities)
- 감정 저널/영화/음악 등 범용 그래프 확장
- 친구 간 그래프 비교 기능
- 개인화 추천 강화(그래프 중심성 기반)
- 타임라인 기반 애니메이션 그래프

---

# 9. 마무리
이 PRD는 독서 데이터를 단순 텍스트 기록에서 "사용자 정체성을 드러내는 의미 기반 네트워크"로 확장하기 위한 전체적인 제품 요구사항을 정의한다. 이 구조는 향후 추천·탐색·커뮤니티 기능까지 확장 가능한 기반을 제공한다.

