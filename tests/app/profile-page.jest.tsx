import { render, screen } from "@testing-library/react"

import ProfileSettingsPage from "@/app/(protected)/profile/[userId]/page"
import { getCurrentUser } from "@/services/auth-service"
import { listReadingEntries } from "@/services/reading-log-service"
import { notFound } from "next/navigation"

jest.mock("next/navigation", () => ({
  notFound: jest.fn(),
}))

jest.mock("@/services/auth-service", () => ({
  getCurrentUser: jest.fn(),
}))

jest.mock("@/services/reading-log-service", () => ({
  listReadingEntries: jest.fn(),
}))

jest.mock("@/components/profile/profile-edit-modal", () => ({
  ProfileEditModal: () => <div data-testid="profile-edit-modal" />,
}))

const mockedGetCurrentUser = getCurrentUser as jest.MockedFunction<
  typeof getCurrentUser
>
const mockedListReadingEntries = listReadingEntries as jest.MockedFunction<
  typeof listReadingEntries
>
const mockedNotFound = notFound as jest.MockedFunction<typeof notFound>

const buildParams = (userId?: string) =>
  Promise.resolve({ userId }) as Promise<{ userId: string | undefined }>

describe("ProfileSettingsPage", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockedNotFound.mockImplementation(() => undefined as never)
  })

  const viewer = {
    id: "user-1",
    email: "reader@example.com",
    firstName: "길동",
    lastName: "홍",
    user_metadata: {},
  } as never

  it("renders profile and empty analysis state when history is insufficient", async () => {
    mockedGetCurrentUser.mockResolvedValue(viewer)
    mockedListReadingEntries.mockResolvedValue({
      success: true,
      data: [
        {
          id: "entry-1",
          userId: "user-1",
          bookTitle: "책1",
          content: "내용",
          userKeywords: [],
          createdAt: "2024-01-01T00:00:00.000Z",
        },
      ],
    })

    const ui = await ProfileSettingsPage({ params: buildParams("user-1") })
    render(ui)

    expect(screen.getByText("홍 길동")).toBeInTheDocument()
    expect(screen.getByText("reader@example.com")).toBeInTheDocument()
    expect(
      screen.getByText("히스토리를 5개 적으면 사용자 분석을 할 수 있어요"),
    ).toBeInTheDocument()
    expect(screen.getByTestId("profile-edit-modal")).toBeInTheDocument()
  })

  it("renders history empty state when entries are missing", async () => {
    mockedGetCurrentUser.mockResolvedValue(viewer)
    mockedListReadingEntries.mockResolvedValue({
      success: true,
      data: [],
    })

    const ui = await ProfileSettingsPage({ params: buildParams("user-1") })
    render(ui)

    expect(screen.getByText("아직 기록이 없어요")).toBeInTheDocument()
    expect(screen.getByTestId("history-empty")).toBeInTheDocument()
  })

  it("hides analysis prompt when there are enough entries", async () => {
    mockedGetCurrentUser.mockResolvedValue(viewer)
    mockedListReadingEntries.mockResolvedValue({
      success: true,
      data: Array.from({ length: 6 }).map((_, index) => ({
        id: `entry-${index}`,
        userId: "user-1",
        bookTitle: "책",
        content: "내용",
        userKeywords: [],
        createdAt: "2024-01-01T00:00:00.000Z",
      })),
    })

    const ui = await ProfileSettingsPage({ params: buildParams("user-1") })
    render(ui)

    expect(
      screen.queryByText("히스토리를 5개 적으면 사용자 분석을 할 수 있어요"),
    ).not.toBeInTheDocument()
  })

  it("calls notFound when userId is missing or mismatched", async () => {
    mockedGetCurrentUser.mockResolvedValue(viewer)
    mockedListReadingEntries.mockResolvedValue({ success: true, data: [] })

    await ProfileSettingsPage({ params: buildParams(undefined) })
    expect(mockedNotFound).toHaveBeenCalled()

    const initialCalls = mockedNotFound.mock.calls.length
    await ProfileSettingsPage({ params: buildParams("other-user") })
    expect(mockedNotFound.mock.calls.length).toBeGreaterThanOrEqual(
      initialCalls + 1,
    )
  })
})
