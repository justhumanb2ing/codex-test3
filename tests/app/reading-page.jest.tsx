import { render, screen } from "@testing-library/react"

import ReadingEntriesPage from "@/app/(protected)/reading/page"
import { getCurrentUser } from "@/services/auth-service"
import { listReadingEntries } from "@/services/reading-log-service"
import { upsertProfileFromClerkUser } from "@/services/profile-service"

jest.mock("@/components/reading/reading-entry-modal", () => ({
  ReadingEntryModal: () => <div data-testid="reading-entry-modal" />,
}))

jest.mock("@/services/auth-service", () => ({
  getCurrentUser: jest.fn(),
}))

jest.mock("@/services/reading-log-service", () => ({
  listReadingEntries: jest.fn(),
}))

jest.mock("@/services/profile-service", () => ({
  upsertProfileFromClerkUser: jest.fn(),
}))

const mockedGetCurrentUser = getCurrentUser as jest.MockedFunction<
  typeof getCurrentUser
>
const mockedListReadingEntries = listReadingEntries as jest.MockedFunction<
  typeof listReadingEntries
>
const mockedUpsertProfile = upsertProfileFromClerkUser as jest.MockedFunction<
  typeof upsertProfileFromClerkUser
>

describe("ReadingEntriesPage", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("renders entries returned from the service", async () => {
    mockedGetCurrentUser.mockResolvedValue({ id: "user-1" } as never)
    mockedUpsertProfile.mockResolvedValue(null)
    mockedListReadingEntries.mockResolvedValue({
      success: true,
      data: [
        {
          id: "entry-1",
          userId: "user-1",
          bookTitle: "데미안",
          content: "감상문",
          userKeywords: [],
          createdAt: "2024-01-01T00:00:00.000Z",
        },
      ],
    })

    const ui = await ReadingEntriesPage({ searchParams: {} })
    render(ui)

    expect(screen.getByText("독서 기록")).toBeInTheDocument()
    expect(screen.getByText("데미안")).toBeInTheDocument()
  })

  it("shows error message when service fails", async () => {
    mockedGetCurrentUser.mockResolvedValue({ id: "user-1" } as never)
    mockedUpsertProfile.mockResolvedValue(null)
    mockedListReadingEntries.mockResolvedValue({
      success: false,
      error: "목록을 불러오지 못했습니다.",
    })

    const ui = await ReadingEntriesPage({ searchParams: {} })
    render(ui)

    expect(
      screen.getByText("목록을 불러오지 못했습니다."),
    ).toBeInTheDocument()
  })
})
