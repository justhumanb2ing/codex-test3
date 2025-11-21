import { createGraphVisualizationService } from "@/services/graph-visualization-service"

const createBuilder = (rows: unknown[] | null, error?: string) => {
  const response = {
    data: rows,
    error: error ? { message: error } : null,
  }

  const builder: Record<string, jest.Mock> = {
    select: jest.fn(),
    in: jest.fn(),
    gte: jest.fn(),
    lte: jest.fn(),
    order: jest.fn(),
    limit: jest.fn(),
  }

  builder.select.mockReturnValue(builder)
  builder.in.mockReturnValue(builder)
  builder.gte.mockReturnValue(builder)
  builder.lte.mockReturnValue(builder)
  builder.order.mockReturnValue(builder)
  builder.limit.mockResolvedValue(response)

  return builder
}

const createSupabaseMock = ({
  nodeRows,
  edgeRows,
  nodeError,
  edgeError,
}: {
  nodeRows: unknown[] | null
  edgeRows: unknown[] | null
  nodeError?: string
  edgeError?: string
}) => {
  const nodeBuilder = createBuilder(nodeRows, nodeError)
  const edgeBuilder = createBuilder(edgeRows, edgeError)

  const from = jest.fn((table: string) => {
    if (table === "graph_nodes") {
      return nodeBuilder
    }
    if (table === "graph_edges") {
      return edgeBuilder
    }
    throw new Error(`Unknown table: ${table}`)
  })

  return {
    client: { from },
    nodeBuilder,
    edgeBuilder,
  }
}

describe("graph-visualization-service", () => {
  const nodeRows = [
    {
      id: "node-book",
      user_id: "user-1",
      node_type: "book",
      label: "데미안",
      metadata: { recordId: "record-1", aiSummary: "요약" },
      created_at: "2024-01-01T00:00:00Z",
    },
    {
      id: "node-topic",
      user_id: "user-1",
      node_type: "topic",
      label: "성장",
      metadata: null,
      created_at: "2024-01-02T00:00:00Z",
    },
  ]

  const edgeRows = [
    {
      id: "edge-1",
      user_id: "user-1",
      source: "node-book",
      target: "node-topic",
      edge_type: "book_topic",
      weight: 0.9,
      created_at: "2024-01-02T00:00:00Z",
    },
  ]

  it("service role API 응답을 위해 노드와 엣지를 정규화한다", async () => {
    const supabase = createSupabaseMock({ nodeRows, edgeRows })
    const service = createGraphVisualizationService({
      supabaseClientFactory: async () => supabase.client as never,
    })

    const result = await service.fetchGraph()

    expect(result.nodes).toHaveLength(2)
    expect(result.edges).toHaveLength(1)
    expect(result.nodes[0]).toMatchObject({
      id: "node-book",
      nodeType: "book",
      metadata: { aiSummary: "요약" },
    })
    expect(result.nodes[0].metadata).not.toHaveProperty("recordId")
    expect(supabase.client.from).toHaveBeenCalledWith("graph_nodes")
    expect(supabase.client.from).toHaveBeenCalledWith("graph_edges")
  })

  it("필터를 적용해 필요한 데이터만 읽는다", async () => {
    const supabase = createSupabaseMock({ nodeRows, edgeRows })
    const service = createGraphVisualizationService({
      supabaseClientFactory: async () => supabase.client as never,
    })

    await service.fetchGraph({
      nodeTypes: ["topic"],
      edgeTypes: ["book_topic"],
      startDate: "2023-12-01",
      endDate: "2024-02-01",
      nodeLimit: 10,
      edgeLimit: 20,
    })

    expect(supabase.nodeBuilder.in).toHaveBeenCalledWith("node_type", ["topic"])
    expect(supabase.nodeBuilder.gte).toHaveBeenCalledWith("created_at", "2023-12-01")
    expect(supabase.nodeBuilder.lte).toHaveBeenCalledWith("created_at", "2024-02-01")
    expect(supabase.edgeBuilder.in).toHaveBeenCalledWith("edge_type", ["book_topic"])
    expect(supabase.edgeBuilder.limit).toHaveBeenCalledWith(20)
  })

  it("Supabase 에러를 그대로 노출한다", async () => {
    const supabase = createSupabaseMock({ nodeRows: null, edgeRows: null, nodeError: "node-error" })
    const service = createGraphVisualizationService({
      supabaseClientFactory: async () => supabase.client as never,
    })

    await expect(service.fetchGraph()).rejects.toThrow("node-error")
  })
})
