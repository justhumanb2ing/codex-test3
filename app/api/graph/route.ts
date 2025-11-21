import { NextResponse } from "next/server"

import type {
  GraphEdgeType,
  GraphNodeType,
} from "@/services/graph-extraction-service"
import {
  createGraphVisualizationService,
  type GraphVisualizationFilters,
} from "@/services/graph-visualization-service"

const NODE_TYPES: GraphNodeType[] = ["book", "topic", "emotion", "author", "genre", "keyword"]
const EDGE_TYPES: GraphEdgeType[] = [
  "book_topic",
  "book_emotion",
  "book_author",
  "book_genre",
  "book_keyword",
]

const service = createGraphVisualizationService()

const parseListParam = <T extends string>(
  searchParams: URLSearchParams,
  key: string,
  allowed: readonly T[],
): T[] | undefined => {
  const values = searchParams.getAll(key)

  if (values.length === 0) {
    const single = searchParams.get(key)
    if (!single) {
      return undefined
    }
    values.push(single)
  }

  const parsed = values
    .flatMap((value) => value.split(","))
    .map((value) => value.trim())
    .filter((value): value is T => allowed.includes(value as T))

  return parsed.length > 0 ? parsed : undefined
}

const parseNumber = (value: string | null): number | undefined => {
  if (!value) {
    return undefined
  }
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : undefined
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)

  const filters: GraphVisualizationFilters = {
    nodeTypes: parseListParam(searchParams, "nodeTypes", NODE_TYPES),
    edgeTypes: parseListParam(searchParams, "edgeTypes", EDGE_TYPES),
    startDate: searchParams.get("startDate") ?? undefined,
    endDate: searchParams.get("endDate") ?? undefined,
    nodeLimit: parseNumber(searchParams.get("nodeLimit")),
    edgeLimit: parseNumber(searchParams.get("edgeLimit")),
  }

  try {
    const graph = await service.fetchGraph(filters)
    return NextResponse.json({ data: graph })
  } catch (error) {
    const message = error instanceof Error ? error.message : "그래프 데이터를 불러오지 못했습니다."
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
