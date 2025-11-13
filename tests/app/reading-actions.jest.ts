import { createReadingEntryAction } from "@/app/(protected)/reading/actions"
import { getCurrentUser } from "@/services/auth-service"
import { createReadingEntry } from "@/services/reading-log-service"
import { generateReadingInsight } from "@/services/reading-insight-service"
import { redirect } from "next/navigation"

jest.mock("next/navigation", () => ({
  redirect: jest.fn(),
}))

jest.mock("@/services/auth-service", () => ({
  getCurrentUser: jest.fn(),
}))

jest.mock("@/services/reading-log-service", () => ({
  createReadingEntry: jest.fn(),
}))

jest.mock("@/services/reading-insight-service", () => ({
  generateReadingInsight: jest.fn(),
}))

const mockedGetCurrentUser = getCurrentUser as jest.MockedFunction<
  typeof getCurrentUser
>
const mockedCreateReadingEntry = createReadingEntry as jest.MockedFunction<
  typeof createReadingEntry
>
const mockedGenerateReadingInsight =
  generateReadingInsight as jest.MockedFunction<typeof generateReadingInsight>
const mockedRedirect = redirect as jest.MockedFunction<typeof redirect>

describe("createReadingEntryAction", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockedRedirect.mockImplementation(() => undefined as never)
  })

  it("returns validation error when fields are missing", async () => {
    const state = await createReadingEntryAction(undefined, new FormData())

    expect(state).toEqual({
      error: "책 제목과 감상문을 모두 입력해주세요.",
    })
  })

  it("returns error when user is not authenticated", async () => {
    const formData = new FormData()
    formData.set("bookTitle", "데미안")
    formData.set("content", "감상문")

    mockedGetCurrentUser.mockResolvedValue(null)

    const state = await createReadingEntryAction(undefined, formData)

    expect(state).toEqual({ error: "로그인이 필요한 기능입니다." })
  })

  it("creates entry and redirects to detail page", async () => {
    const formData = new FormData()
    formData.set("bookTitle", "데미안")
    formData.set("content", "감동적인 이야기")
    formData.set("keywords", "성장, 우정")

    mockedGetCurrentUser.mockResolvedValue({ id: "user-1" } as never)
    mockedGenerateReadingInsight.mockResolvedValue({
      summary: "요약",
      emotions: [],
      topics: [],
    })
    mockedCreateReadingEntry.mockResolvedValue({
      success: true,
      data: {
        id: "entry-1",
        userId: "user-1",
        bookTitle: "데미안",
        content: "감동적인 이야기",
        userKeywords: ["성장", "우정"],
        aiSummary: "요약",
        aiEmotions: [],
        aiTopics: [],
        createdAt: "2024-01-01T00:00:00.000Z",
      },
    })

    await createReadingEntryAction(undefined, formData)

    expect(mockedCreateReadingEntry).toHaveBeenCalled()
    expect(mockedRedirect).toHaveBeenCalledWith("/reading/entry-1")
  })

  it("returns error when service fails", async () => {
    const formData = new FormData()
    formData.set("bookTitle", "데미안")
    formData.set("content", "감동적인 이야기")

    mockedGetCurrentUser.mockResolvedValue({ id: "user-1" } as never)
    mockedGenerateReadingInsight.mockResolvedValue({
      summary: "요약",
      emotions: [],
      topics: [],
    })
    mockedCreateReadingEntry.mockResolvedValue({
      success: false,
      error: "저장 실패",
    })

    const state = await createReadingEntryAction(undefined, formData)

    expect(state).toEqual({ error: "저장 실패" })
  })
})
