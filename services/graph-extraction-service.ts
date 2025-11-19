import { createServerSupabaseClient } from "@/config/supabase"
import {
  createGeminiAnalyzerProvider,
  type GraphAnalyzerProvider,
} from "@/services/graph-analyzer-provider"
import type {
  EmotionInsight,
  GraphAnalyzer,
  GraphAnalyzerInput,
  GraphAnalyzerResult,
  TopicInsight,
} from "@/types/graph-analyzer"

export type {
  EmotionInsight,
  GraphAnalyzer,
  GraphAnalyzerInput,
  GraphAnalyzerResult,
  TopicInsight,
} from "@/types/graph-analyzer"

const GRAPH_NODE_TABLE = "graph_nodes"
const GRAPH_EDGE_TABLE = "graph_edges"
const DEFAULT_ERROR_MESSAGE = "그래프 데이터를 생성하는 중 문제가 발생했습니다."

export type GraphNodeType =
  | "book"
  | "topic"
  | "emotion"
  | "author"
  | "genre"
  | "keyword"

export type GraphEdgeType =
  | "book_topic"
  | "book_emotion"
  | "book_author"
  | "book_genre"
  | "book_keyword"

export interface GraphRecordInput {
  recordId: string
  userId: string
  bookTitle: string
  content: string
  userKeywords: string[]
}

export interface GraphExtractionOutcome {
  success: boolean
  nodesInserted?: number
  edgesInserted?: number
  analysis?: GraphAnalyzerResult
  error?: string
}

export interface GraphExtractionService {
  processRecord: (record: GraphRecordInput) => Promise<GraphExtractionOutcome>
}

export interface GraphExtractionOptions {
  analyzer?: GraphAnalyzer
  analyzerProvider?: GraphAnalyzerProvider
  supabaseClientFactory?: typeof createServerSupabaseClient
}

interface GraphNodeInsertPayload {
  user_id: string
  node_type: GraphNodeType
  label: string
  metadata?: Record<string, unknown> | null
}

interface GraphNodeRow extends GraphNodeInsertPayload {
  id: string
}

interface GraphEdgeInsertPayload {
  user_id: string
  source: string
  target: string
  edge_type: GraphEdgeType
  weight: number
}

interface GraphEdgeRow extends GraphEdgeInsertPayload {
  id: string
}

const normalizeAnalysisResult = (
  analysis: GraphAnalyzerResult,
): GraphAnalyzerResult => ({
  aiSummary: analysis.aiSummary ?? null,
  topics: analysis.topics ?? [],
  emotions: analysis.emotions ?? [],
  authors: analysis.authors ?? [],
  genres: analysis.genres ?? [],
  keywords: analysis.keywords ?? [],
})

const isSourceArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === "string")

const normalizeLabel = (label: string): string => label.trim()

const buildNodeKey = (userId: string, type: GraphNodeType, label: string): string =>
  `${userId}:${type}:${normalizeLabel(label).toLowerCase()}`

const mergeMetadata = (
  existing: Record<string, unknown> | null,
  incoming?: Record<string, unknown>,
): Record<string, unknown> | null => {
  if (!existing) {
    return incoming ?? null
  }

  if (!incoming) {
    return existing
  }

  const merged: Record<string, unknown> = { ...existing, ...incoming }
  const existingSources = isSourceArray(existing["sources"]) ? existing["sources"] : []
  const incomingSources = isSourceArray(incoming["sources"]) ? incoming["sources"] : []

  if (existingSources.length > 0 || incomingSources.length > 0) {
    merged["sources"] = Array.from(new Set([...existingSources, ...incomingSources]))
  }

  return merged
}

const buildNodePayloads = (
  record: GraphRecordInput,
  analysis: GraphAnalyzerResult,
): GraphNodeInsertPayload[] => {
  const map = new Map<string, GraphNodeInsertPayload>()

  const addNode = (
    nodeType: GraphNodeType,
    label: string,
    metadata?: Record<string, unknown>,
  ): void => {
    const normalized = normalizeLabel(label)
    if (!normalized) {
      return
    }

    const key = buildNodeKey(record.userId, nodeType, normalized)
    const base: GraphNodeInsertPayload = {
      user_id: record.userId,
      node_type: nodeType,
      label: normalized,
      metadata: metadata ?? null,
    }

    const existing = map.get(key)
    if (existing) {
      map.set(key, {
        ...existing,
        metadata: mergeMetadata(existing.metadata ?? null, metadata),
      })
      return
    }

    map.set(key, base)
  }

  addNode("book", record.bookTitle, {
    recordId: record.recordId,
    aiSummary: analysis.aiSummary ?? null,
    sources: ["record"],
  })

  analysis.topics.forEach((topic) => {
    addNode("topic", topic.label, {
      relevance: topic.relevance ?? null,
      sources: ["ai"],
    })
  })

  analysis.emotions.forEach((emotion) => {
    addNode("emotion", emotion.label, {
      intensity: emotion.intensity ?? null,
      sources: ["ai"],
    })
  })

  analysis.authors.forEach((author) => {
    addNode("author", author, { sources: ["ai"] })
  })

  analysis.genres.forEach((genre) => {
    addNode("genre", genre, { sources: ["ai"] })
  })

  const keywordSources = new Map<string, Set<string>>()
  record.userKeywords.forEach((keyword) => {
    const normalized = normalizeLabel(keyword)
    if (!normalized) {
      return
    }
    const existingSources = keywordSources.get(normalized) ?? new Set<string>()
    existingSources.add("user")
    keywordSources.set(normalized, existingSources)
  })

  analysis.keywords.forEach((keyword) => {
    const normalized = normalizeLabel(keyword)
    if (!normalized) {
      return
    }
    const existingSources = keywordSources.get(normalized) ?? new Set<string>()
    existingSources.add("ai")
    keywordSources.set(normalized, existingSources)
  })

  keywordSources.forEach((sources, label) => {
    addNode("keyword", label, { sources: Array.from(sources) })
  })

  return Array.from(map.values())
}

const resolveWeight = (value?: number | null): number => {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return 1
  }

  const clamped = Math.max(0.1, Math.min(100, value))
  return Number(clamped.toFixed(2))
}

const buildEdgePayloads = (
  userId: string,
  bookNode: GraphNodeRow,
  nodeRows: GraphNodeRow[],
  analysis: GraphAnalyzerResult,
  record: GraphRecordInput,
): GraphEdgeInsertPayload[] => {
  const nodeMap = new Map<string, GraphNodeRow>()
  nodeRows.forEach((row) => {
    nodeMap.set(buildNodeKey(row.user_id, row.node_type, row.label), row)
  })

  const edges: GraphEdgeInsertPayload[] = []

  const connect = (
    nodeType: GraphNodeType,
    label: string,
    edgeType: GraphEdgeType,
    weight: number,
  ): void => {
    const normalized = normalizeLabel(label)
    if (!normalized) {
      return
    }
    const target = nodeMap.get(buildNodeKey(userId, nodeType, normalized))
    if (!target || target.id === bookNode.id) {
      return
    }
    edges.push({
      user_id: userId,
      source: bookNode.id,
      target: target.id,
      edge_type: edgeType,
      weight,
    })
  }

  analysis.topics.forEach((topic) => {
    connect("topic", topic.label, "book_topic", resolveWeight(topic.relevance ?? null))
  })

  analysis.emotions.forEach((emotion) => {
    connect("emotion", emotion.label, "book_emotion", resolveWeight(emotion.intensity ?? null))
  })

  analysis.authors.forEach((author) => {
    connect("author", author, "book_author", 1)
  })

  analysis.genres.forEach((genre) => {
    connect("genre", genre, "book_genre", 1)
  })

  const keywordSet = new Set<string>()
  record.userKeywords.forEach((keyword) => keywordSet.add(normalizeLabel(keyword)))
  analysis.keywords.forEach((keyword) => keywordSet.add(normalizeLabel(keyword)))

  keywordSet.forEach((keyword) => {
    if (!keyword) {
      return
    }
    connect("keyword", keyword, "book_keyword", 1)
  })

  return edges
}

const findBookNode = (
  userId: string,
  bookTitle: string,
  nodeRows: GraphNodeRow[],
): GraphNodeRow | undefined => {
  const normalized = normalizeLabel(bookTitle)
  return nodeRows.find(
    (row) => row.user_id === userId && row.node_type === "book" && row.label === normalized,
  )
}

/**
 * 레코드의 감상문을 분석하고 그래프 노드/엣지를 저장하는 파이프라인을 생성합니다.
 */
export const createGraphExtractionService = ({
  analyzer,
  analyzerProvider,
  supabaseClientFactory = createServerSupabaseClient,
}: GraphExtractionOptions = {}): GraphExtractionService => {
  let memoizedProvider: GraphAnalyzerProvider | null = analyzerProvider ?? null

  const getAnalyzer = (): Promise<GraphAnalyzer> => {
    if (analyzer) {
      return Promise.resolve(analyzer)
    }
    if (!memoizedProvider) {
      memoizedProvider = createGeminiAnalyzerProvider()
    }
    return memoizedProvider.getAnalyzer()
  }

  const processRecord = async (
    record: GraphRecordInput,
  ): Promise<GraphExtractionOutcome> => {
    let analysis: GraphAnalyzerResult

    try {
      const resolvedAnalyzer = await getAnalyzer()
      analysis = await resolvedAnalyzer.analyze({
        content: record.content,
        bookTitle: record.bookTitle,
        userKeywords: record.userKeywords,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : DEFAULT_ERROR_MESSAGE
      return { success: false, error: message }
    }

    const supabase = await supabaseClientFactory()
    const normalizedAnalysis = normalizeAnalysisResult(analysis)
    const nodePayloads = buildNodePayloads(record, normalizedAnalysis)

    if (nodePayloads.length === 0) {
      return { success: false, error: "생성할 노드가 없습니다." }
    }

    const { data: nodeData, error: nodeError } = await supabase
      .from(GRAPH_NODE_TABLE)
      .upsert(nodePayloads, { onConflict: "user_id,node_type,label" })
      .select()

    if (nodeError || !nodeData) {
      return { success: false, error: nodeError?.message ?? DEFAULT_ERROR_MESSAGE }
    }

    const nodeRows = nodeData as GraphNodeRow[]
    const bookNode = findBookNode(record.userId, record.bookTitle, nodeRows)

    if (!bookNode) {
      return { success: false, error: "책 노드를 찾을 수 없습니다." }
    }

    const edgePayloads = buildEdgePayloads(
      record.userId,
      bookNode,
      nodeRows,
      normalizedAnalysis,
      record,
    )

    if (edgePayloads.length === 0) {
      return {
        success: true,
        nodesInserted: nodeRows.length,
        edgesInserted: 0,
        analysis: normalizedAnalysis,
      }
    }

    const { data: edgeData, error: edgeError } = await supabase
      .from(GRAPH_EDGE_TABLE)
      .upsert(edgePayloads, {
        onConflict: "user_id,source,target,edge_type",
      })
      .select()

    if (edgeError || !edgeData) {
      return { success: false, error: edgeError?.message ?? DEFAULT_ERROR_MESSAGE }
    }

    return {
      success: true,
      nodesInserted: nodeRows.length,
      edgesInserted: (edgeData as GraphEdgeRow[]).length,
      analysis: normalizedAnalysis,
    }
  }

  return { processRecord }
}
