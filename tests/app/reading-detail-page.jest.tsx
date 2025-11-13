import { render, screen } from "@testing-library/react"

import ReadingEntryDetailPage from "@/app/(protected)/reading/[entryId]/page"
import { getCurrentUser } from "@/services/auth-service"
import { getReadingEntry } from "@/services/reading-log-service"

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, ...props }: { children: React.ReactNode }) => (
    <a {...props}>{children}</a>
  ),
}))

jest.mock("@/services/auth-service", () => ({
  getCurrentUser: jest.fn(),
}))

jest.mock("@/services/reading-log-service", () => ({
  getReadingEntry: jest.fn(),
}))

jest.mock("@/components/reading/reading-entry-summary", () => ({
  ReadingEntrySummary: ({ summary }: { summary: string }) => (
    <div data-testid="reading-summary">{summary}</div>
  ),
}))

const mockedGetCurrentUser = getCurrentUser as jest.MockedFunction<
  typeof getCurrentUser
>
const mockedGetReadingEntry = getReadingEntry as jest.MockedFunction<
  typeof getReadingEntry
>

describe("ReadingEntryDetailPage", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("renders entry details", async () => {
    mockedGetCurrentUser.mockResolvedValue({ id: "user-1" } as never)
    mockedGetReadingEntry.mockResolvedValue({
      success: true,
      data: {
        id: "entry-1",
        userId: "user-1",
        bookTitle: "데미안",
        content: "첫 문장\n둘째 문장",
        userKeywords: ["성장"],
        aiSummary: "요약",
        aiEmotions: [],
        aiTopics: [],
        createdAt: "2024-01-01T00:00:00.000Z",
      },
    })

    const ui = await ReadingEntryDetailPage({ params: { entryId: "entry-1" } })
    render(ui)

    expect(screen.getByText("데미안")).toBeInTheDocument()
    expect(screen.getByText("#성장")).toBeInTheDocument()
    expect(screen.getAllByText(/문장/)).toHaveLength(2)
  })

  it("shows fallback when service fails", async () => {
    mockedGetCurrentUser.mockResolvedValue({ id: "user-1" } as never)
    mockedGetReadingEntry.mockResolvedValue({
      success: false,
      error: "조회 실패",
    })

    const ui = await ReadingEntryDetailPage({ params: { entryId: "entry-1" } })
    render(ui)

    expect(
      screen.getByText("상세 정보를 불러오지 못했습니다. 잠시 후 다시 시도해주세요."),
    ).toBeInTheDocument()
  })
})
