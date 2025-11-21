import { createServiceRoleSupabaseClient } from "@/config/supabase"
import type {
  GraphEdgeType,
  GraphNodeType,
} from "@/services/graph-extraction-service"
import type { SupabaseClient } from "@supabase/supabase-js"

const GRAPH_NODE_TABLE = "graph_nodes"
const GRAPH_EDGE_TABLE = "graph_edges"
const DEFAULT_NODE_LIMIT = 200
const DEFAULT_EDGE_LIMIT = 400
const MAX_NODE_LIMIT = 1000
const MAX_EDGE_LIMIT = 2000

interface GraphNodeRow {
  id: string
  user_id: string
  node_type: GraphNodeType
  label: string
  metadata: Record<string, unknown> | null
  created_at: string
}

interface GraphEdgeRow {
  id: string
  user_id: string
  source: string
  target: string
  edge_type: GraphEdgeType
  weight: number
  created_at: string
}

export interface GraphVisualizationNode {
  id: string
  label: string
  nodeType: GraphNodeType
  metadata: Record<string, unknown> | null
  createdAt: string
}

export interface GraphVisualizationEdge {
  id: string
  source: string
  target: string
  edgeType: GraphEdgeType
  weight: number
  createdAt: string
}

export interface GraphVisualizationResult {
  nodes: GraphVisualizationNode[]
  edges: GraphVisualizationEdge[]
}

export interface GraphVisualizationFilters {
  nodeTypes?: GraphNodeType[]
  edgeTypes?: GraphEdgeType[]
  startDate?: string
  endDate?: string
  nodeLimit?: number
  edgeLimit?: number
}

export interface GraphVisualizationOptions {
  supabaseClientFactory?: () => Promise<SupabaseClient>
}

export interface GraphVisualizationService {
  fetchGraph: (filters?: GraphVisualizationFilters) => Promise<GraphVisualizationResult>
}

const sanitizeMetadata = (
  metadata: Record<string, unknown> | null,
): Record<string, unknown> | null => {
  if (!metadata) {
    return null
  }

  const clone = { ...metadata }
  delete clone["recordId"]
  return Object.keys(clone).length > 0 ? clone : null
}

const clampLimit = (value: number | undefined, fallback: number, max: number): number => {
  if (!value || Number.isNaN(value)) {
    return fallback
  }
  return Math.max(1, Math.min(max, Math.floor(value)))
}

const hasItems = <T>(values?: T[]): values is T[] =>
  Array.isArray(values) && values.length > 0

export const createGraphVisualizationService = ({
  supabaseClientFactory = createServiceRoleSupabaseClient,
}: GraphVisualizationOptions = {}): GraphVisualizationService => {
  const fetchGraph = async (
    filters: GraphVisualizationFilters = {},
  ): Promise<GraphVisualizationResult> => {
    const supabase = await supabaseClientFactory()
    const nodeLimit = clampLimit(filters.nodeLimit, DEFAULT_NODE_LIMIT, MAX_NODE_LIMIT)
    const edgeLimit = clampLimit(filters.edgeLimit ?? filters.nodeLimit, DEFAULT_EDGE_LIMIT, MAX_EDGE_LIMIT)

    let nodeQuery = supabase.from(GRAPH_NODE_TABLE)

    if (hasItems(filters.nodeTypes)) {
      nodeQuery = nodeQuery.in("node_type", filters.nodeTypes)
    }
    if (filters.startDate) {
      nodeQuery = nodeQuery.gte("created_at", filters.startDate)
    }
    if (filters.endDate) {
      nodeQuery = nodeQuery.lte("created_at", filters.endDate)
    }

    const {
      data: nodeRows,
      error: nodeError,
    } = await nodeQuery
      .select("*")
      .order("created_at", { ascending: false })
      .limit(nodeLimit)

    if (nodeError) {
      throw new Error(nodeError.message)
    }

    if (!nodeRows || nodeRows.length === 0) {
      return { nodes: [], edges: [] }
    }

    const nodeIds = nodeRows.map((node) => node.id)
    let edgeQuery = supabase.from(GRAPH_EDGE_TABLE)

    if (nodeIds.length > 0) {
      edgeQuery = edgeQuery.in("source", nodeIds)
    }
    if (hasItems(filters.edgeTypes)) {
      edgeQuery = edgeQuery.in("edge_type", filters.edgeTypes)
    }
    if (filters.startDate) {
      edgeQuery = edgeQuery.gte("created_at", filters.startDate)
    }
    if (filters.endDate) {
      edgeQuery = edgeQuery.lte("created_at", filters.endDate)
    }

    const {
      data: edgeRows,
      error: edgeError,
    } = await edgeQuery
      .select("*")
      .order("created_at", { ascending: false })
      .limit(edgeLimit)

    if (edgeError) {
      throw new Error(edgeError.message)
    }

    return {
      nodes: nodeRows.map((node) => ({
        id: node.id,
        label: node.label,
        nodeType: node.node_type,
        metadata: sanitizeMetadata(node.metadata),
        createdAt: node.created_at,
      })),
      edges:
        edgeRows?.map((edge) => ({
          id: edge.id,
          source: edge.source,
          target: edge.target,
          edgeType: edge.edge_type,
          weight: edge.weight,
          createdAt: edge.created_at,
        })) ?? [],
    }
  }

  return { fetchGraph }
}
