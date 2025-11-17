import {
  createReadingEntry,
  deleteReadingEntry,
  getReadingEntry,
  listReadingEntries,
} from "@/services/reading-log-service"
import { createServerSupabaseClient } from "@/config/supabase"

jest.mock("@/config/supabase", () => ({
  createServerSupabaseClient: jest.fn(),
}))

type SupabaseInsertChain = {
  select: jest.Mock<{
    single: jest.Mock
  }>
  single: jest.Mock
}

type SupabaseSelectChain = {
  eq: jest.Mock
  order?: jest.Mock
  single?: jest.Mock
}

type MockSupabaseClient = {
  from: jest.Mock
}

const mockedCreateClient = createServerSupabaseClient as jest.MockedFunction<
  typeof createServerSupabaseClient
>

const createInsertClient = (
  response: unknown,
  error: unknown,
): MockSupabaseClient => {
  const single = jest.fn().mockResolvedValue({ data: response, error })
  const select = jest.fn(() => ({ single })) as SupabaseInsertChain
  const insert = jest.fn(() => ({ select }))
  return {
    from: jest.fn(() => ({ insert })),
  }
}

const createListClient = (response: unknown, error: unknown): MockSupabaseClient => {
  const order = jest.fn().mockResolvedValue({ data: response, error })
  const eq = jest.fn(() => ({ order })) as SupabaseSelectChain
  const select = jest.fn(() => ({ eq }))
  return {
    from: jest.fn(() => ({ select })),
  }
}

const createGetClient = (response: unknown, error: any): MockSupabaseClient => {
  const single = jest.fn().mockResolvedValue({ data: response, error })
  const selectChain: SupabaseSelectChain = {
    eq: jest.fn(() => selectChain),
    single,
  }
  const select = jest.fn(() => selectChain)
  return {
    from: jest.fn(() => ({ select })),
  }
}

const buildRow = () => ({
  id: "entry-1",
  user_id: "user-1",
  book_title: "데미안",
  content: "감상문",
  user_keywords: ["성장"],
  created_at: "2024-01-01T00:00:00.000Z",
})

describe("reading-log-service", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("creates a reading entry and returns mapped result", async () => {
    const row = buildRow()
    const client = createInsertClient(row, null)
    mockedCreateClient.mockResolvedValue(client as never)

    const result = await createReadingEntry({
      userId: "user-1",
      bookTitle: "데미안",
      content: "감상문",
      userKeywords: ["성장"],
    })

    expect(result.success).toBe(true)
    expect(result.data).toEqual({
      id: row.id,
      userId: row.user_id,
      bookTitle: row.book_title,
      content: row.content,
      userKeywords: row.user_keywords,
      createdAt: row.created_at,
    })
  })

  it("returns error when creation fails", async () => {
    const client = createInsertClient(null, { message: "database error" })
    mockedCreateClient.mockResolvedValue(client as never)

    const result = await createReadingEntry({
      userId: "user-1",
      bookTitle: "데미안",
      content: "감상문",
      userKeywords: [],
    })

    expect(result.success).toBe(false)
    expect(result.error).toBe("database error")
  })

  it("lists reading entries ordered by created_at", async () => {
    const row = buildRow()
    const client = createListClient([row], null)
    mockedCreateClient.mockResolvedValue(client as never)

    const result = await listReadingEntries("user-1")

    expect(result.success).toBe(true)
    expect(result.data).toHaveLength(1)
    expect(result.data?.[0]?.id).toBe(row.id)
  })

  it("returns null data when entry is not found", async () => {
    const error = { code: "PGRST116", message: "No rows" }
    const client = createGetClient(null, error)
    mockedCreateClient.mockResolvedValue(client as never)

    const result = await getReadingEntry("user-1", "entry-404")

    expect(result.success).toBe(true)
    expect(result.data).toBeNull()
  })

  it("returns error when get fails with different code", async () => {
    const error = { code: "400", message: "bad request" }
    const client = createGetClient(null, error)
    mockedCreateClient.mockResolvedValue(client as never)

    const result = await getReadingEntry("user-1", "entry-500")

    expect(result.success).toBe(false)
    expect(result.error).toBe("bad request")
  })

  it("deletes a reading entry", async () => {
    const deleteChain = {
      delete: jest.fn(() => ({
        eq: jest.fn(() => ({
          eq: jest.fn(() => Promise.resolve({ error: null })),
        })),
      })),
    }
    const client = { from: jest.fn(() => deleteChain) }
    mockedCreateClient.mockResolvedValue(client as never)

    const result = await deleteReadingEntry("user-1", "entry-1")

    expect(result.success).toBe(true)
  })
})
