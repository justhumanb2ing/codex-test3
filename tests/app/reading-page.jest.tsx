import { render, screen } from "@testing-library/react"

import ReadingEntriesPage from "@/app/(protected)/reading/page"
import { getCurrentUser } from "@/services/auth-service"
import { listReadingEntries } from "@/services/reading-log-service"

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
  listReadingEntries: jest.fn(),
}))

const mockedGetCurrentUser = getCurrentUser as jest.MockedFunction<
  typeof getCurrentUser
>
const mockedListReadingEntries = listReadingEntries as jest.MockedFunction<
  typeof listReadingEntries
>

describe("ReadingEntriesPage", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("renders entries returned from the service", async () => {
    mockedGetCurrentUser.mockResolvedValue({ id: "user-1" } as never)
    mockedListReadingEntries.mockResolvedValue({
      success: true,
      data: [
        {
          id: "entry-1",
          userId: "user-1",
          bookTitle: "데미안",
          content: "감상문",
          userKeywords: [],
          aiSummary: "요약",
          aiEmotions: [],
          aiTopics: [],
          createdAt: "2024-01-01T00:00:00.000Z",
        },
      ],
    })

    const ui = await ReadingEntriesPage()
    render(ui)

    expect(screen.getByText("독서 기록")).toBeInTheDocument()
    expect(screen.getByText("데미안")).toBeInTheDocument()
  })

  it("shows error message when service fails", async () => {
    mockedGetCurrentUser.mockResolvedValue({ id: "user-1" } as never)
    mockedListReadingEntries.mockResolvedValue({
      success: false,
      error: "목록을 불러오지 못했습니다.",
    })

    const ui = await ReadingEntriesPage()
    render(ui)

    expect(
      screen.getByText("목록을 불러오지 못했습니다."),
    ).toBeInTheDocument()
  })
})
