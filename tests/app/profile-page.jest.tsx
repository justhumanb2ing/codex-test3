import { render, screen } from "@testing-library/react"

import ProfileSettingsPage from "@/app/(protected)/profile/page"
import { getCurrentUser } from "@/services/auth-service"
import { listReadingEntries } from "@/services/reading-log-service"
import { redirect } from "next/navigation"

jest.mock("next/navigation", () => ({
  redirect: jest.fn(),
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
const mockedRedirect = redirect as jest.MockedFunction<typeof redirect>

describe("ProfileSettingsPage", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockedRedirect.mockImplementation(() => undefined as never)
  })

  it("renders empty analysis state when history is insufficient", async () => {
    mockedGetCurrentUser.mockResolvedValue({
      id: "user-1",
      email: "reader@example.com",
      user_metadata: {
        full_name: "홍길동",
      },
    } as never)
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

    const ui = await ProfileSettingsPage()
    render(ui)

    expect(screen.getByText("홍길동")).toBeInTheDocument()
    expect(screen.getByText("reader@example.com")).toBeInTheDocument()
    expect(screen.getByText("독서 히스토리 시각화")).toBeInTheDocument()
    expect(screen.getByText("업적 및 배지")).toBeInTheDocument()
    expect(
      screen.getByText("히스토리를 5개 적으면 사용자 분석을 할 수 있어요"),
    ).toBeInTheDocument()
    const analysisButton = screen.getByTestId("analysis-empty").querySelector(
      "button",
    ) as HTMLButtonElement
    expect(analysisButton).toBeDisabled()
  })

  it("renders history empty state when there are no entries", async () => {
    mockedGetCurrentUser.mockResolvedValue({
      id: "user-1",
      email: "reader@example.com",
      user_metadata: {
        full_name: "홍길동",
      },
    } as never)
    mockedListReadingEntries.mockResolvedValue({
      success: true,
      data: [],
    })

    const ui = await ProfileSettingsPage()
    render(ui)

    expect(
      screen.getByText("아직 기록이 없어요"),
    ).toBeInTheDocument()
    expect(screen.getByTestId("history-empty")).toBeInTheDocument()
  })

  it("shows enabled analysis button when history is sufficient", async () => {
    mockedGetCurrentUser.mockResolvedValue({
      id: "user-1",
      email: "reader@example.com",
      user_metadata: {
        full_name: "홍길동",
      },
    } as never)
    mockedListReadingEntries.mockResolvedValue({
      success: true,
      data: Array.from({ length: 6 }).map((_, index) => ({
        id: `entry-${index + 1}`,
        userId: "user-1",
        bookTitle: `책${index + 1}`,
        content: "내용",
        userKeywords: [],
        createdAt: "2024-01-01T00:00:00.000Z",
      })),
    })

    const ui = await ProfileSettingsPage()
    render(ui)

    expect(
      screen.queryByText("히스토리를 5개 적으면 사용자 분석을 할 수 있어요"),
    ).not.toBeInTheDocument()
    const button = screen.getByRole("button", { name: "사용자 분석 열기" })
    expect(button).toBeEnabled()
  })

  it("redirects to login when user is missing", async () => {
    mockedGetCurrentUser.mockResolvedValue(null)
    mockedListReadingEntries.mockResolvedValue({
      success: true,
      data: [],
    })

    await ProfileSettingsPage()

    expect(mockedRedirect).toHaveBeenCalledWith("/login")
  })
})
