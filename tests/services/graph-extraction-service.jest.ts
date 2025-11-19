import type { GraphAnalyzerResult } from "@/services/graph-extraction-service"
import { createGraphExtractionService } from "@/services/graph-extraction-service"

jest.mock("@/config/supabase", () => ({
  createServerSupabaseClient: jest.fn(),
}))

describe("graph-extraction-service", () => {
  const record = {
    recordId: "record-1",
    userId: "user-1",
    bookTitle: "데미안",
    content: "감상문 전문",
    userKeywords: ["자아", "여정"],
  }

  const analyzerResult: GraphAnalyzerResult = {
    aiSummary: "요약",
    topics: [
      { label: "성장", relevance: 0.85 },
      { label: "자기 발견", relevance: 0.55 },
    ],
    emotions: [{ label: "희망", intensity: 0.92 }],
    authors: ["헤르만 헤세"],
    genres: ["성장소설"],
    keywords: ["자아", "성장"],
  }

  const createSupabaseMock = (options?: {
    nodeError?: string
    edgeError?: string
  }) => {
    const nodeRows = [
      { id: "node-book", user_id: "user-1", node_type: "book", label: "데미안", metadata: null },
      { id: "node-topic-1", user_id: "user-1", node_type: "topic", label: "성장", metadata: null },
      {
        id: "node-topic-2",
        user_id: "user-1",
        node_type: "topic",
        label: "자기 발견",
        metadata: null,
      },
      {
        id: "node-emotion",
        user_id: "user-1",
        node_type: "emotion",
        label: "희망",
        metadata: null,
      },
      {
        id: "node-author",
        user_id: "user-1",
        node_type: "author",
        label: "헤르만 헤세",
        metadata: null,
      },
      {
        id: "node-genre",
        user_id: "user-1",
        node_type: "genre",
        label: "성장소설",
        metadata: null,
      },
      {
        id: "node-keyword-1",
        user_id: "user-1",
        node_type: "keyword",
        label: "자아",
        metadata: null,
      },
      {
        id: "node-keyword-2",
        user_id: "user-1",
        node_type: "keyword",
        label: "여정",
        metadata: null,
      },
      {
        id: "node-keyword-3",
        user_id: "user-1",
        node_type: "keyword",
        label: "성장",
        metadata: null,
      },
    ]

    const edgeRows = Array.from({ length: 8 }).map((_, index) => ({
      id: `edge-${index}`,
      user_id: "user-1",
      source: "node-book",
      target: `node-target-${index}`,
      edge_type: "book_topic",
      weight: 1,
    }))

    const nodeSelect = jest.fn().mockResolvedValue({
      data: options?.nodeError ? null : nodeRows,
      error: options?.nodeError ? { message: options.nodeError } : null,
    })
    const edgeSelect = jest.fn().mockResolvedValue({
      data: options?.edgeError ? null : edgeRows,
      error: options?.edgeError ? { message: options.edgeError } : null,
    })

    const nodeUpsert = jest.fn(() => ({ select: nodeSelect }))
    const edgeUpsert = jest.fn(() => ({ select: edgeSelect }))

    const from = jest.fn((table: string) => {
      if (table === "graph_nodes") {
        return { upsert: nodeUpsert }
      }
      if (table === "graph_edges") {
        return { upsert: edgeUpsert }
      }
      throw new Error(`Unknown table: ${table}`)
    })

    return {
      client: { from },
      nodeUpsert,
      edgeUpsert,
      nodeSelect,
      edgeSelect,
    }
  }

  it("분석 결과를 기반으로 노드와 엣지를 저장한다", async () => {
    const analyzer = { analyze: jest.fn().mockResolvedValue(analyzerResult) }
    const supabaseMock = createSupabaseMock()
    const service = createGraphExtractionService({
      analyzer,
      supabaseClientFactory: async () => supabaseMock.client as never,
    })

    const result = await service.processRecord(record)

    expect(result.success).toBe(true)
    expect(result.nodesInserted).toBeGreaterThan(0)
    expect(result.edgesInserted).toBeGreaterThan(0)
    expect(analyzer.analyze).toHaveBeenCalledWith({
      content: record.content,
      bookTitle: record.bookTitle,
      userKeywords: record.userKeywords,
    })

    const nodePayloads = supabaseMock.nodeUpsert.mock.calls[0][0] as Array<{
      node_type: string
      label: string
      metadata?: Record<string, unknown> | null
    }>

    const keywordNode = nodePayloads.find(
      (node) => node.node_type === "keyword" && node.label === "자아",
    )

    expect(keywordNode?.metadata).toMatchObject({
      sources: expect.arrayContaining(["user", "ai"]),
    })

    const edgePayloads = supabaseMock.edgeUpsert.mock.calls[0][0] as Array<{
      edge_type: string
      weight: number
    }>

    expect(edgePayloads.length).toBe(8)
    expect(edgePayloads).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ edge_type: "book_topic", weight: 0.85 }),
        expect.objectContaining({ edge_type: "book_emotion", weight: 0.92 }),
        expect.objectContaining({ edge_type: "book_keyword" }),
      ]),
    )
  })

  it("노드 업서트 실패 시 에러를 반환한다", async () => {
    const analyzer = { analyze: jest.fn().mockResolvedValue(analyzerResult) }
    const supabaseMock = createSupabaseMock({ nodeError: "node error" })
    const service = createGraphExtractionService({
      analyzer,
      supabaseClientFactory: async () => supabaseMock.client as never,
    })

    const result = await service.processRecord(record)

    expect(result.success).toBe(false)
    expect(result.error).toBe("node error")
    expect(supabaseMock.edgeUpsert).not.toHaveBeenCalled()
  })

  it("분석기 에러를 전달한다", async () => {
    const analyzer = { analyze: jest.fn().mockRejectedValue(new Error("ai down")) }
    const supabaseMock = createSupabaseMock()
    const service = createGraphExtractionService({
      analyzer,
      supabaseClientFactory: async () => supabaseMock.client as never,
    })

    const result = await service.processRecord(record)

    expect(result.success).toBe(false)
    expect(result.error).toBe("ai down")
    expect(supabaseMock.nodeUpsert).not.toHaveBeenCalled()
  })

  it("analyzerProvider를 통해 기본 분석기를 지연 로딩한다", async () => {
    const analyzer = { analyze: jest.fn().mockResolvedValue(analyzerResult) }
    const provider = { getAnalyzer: jest.fn().mockResolvedValue(analyzer) }
    const supabaseMock = createSupabaseMock()
    const service = createGraphExtractionService({
      analyzerProvider: provider,
      supabaseClientFactory: async () => supabaseMock.client as never,
    })

    const result = await service.processRecord(record)

    expect(result.success).toBe(true)
    expect(provider.getAnalyzer).toHaveBeenCalledTimes(1)
    expect(analyzer.analyze).toHaveBeenCalledTimes(1)
  })
})
