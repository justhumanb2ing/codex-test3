import { render, screen } from "@testing-library/react"

import ProfileSettingsPage from "@/app/(protected)/profile/[userId]/page"
import { getCurrentUser } from "@/services/auth-service"
import { getProfileById } from "@/services/profile-service"
import { listReadingEntries } from "@/services/reading-log-service"
import { notFound } from "next/navigation"

jest.mock("next/navigation", () => ({
  notFound: jest.fn(),
}))

jest.mock("@/services/auth-service", () => ({
  getCurrentUser: jest.fn(),
}))

jest.mock("@/services/profile-service", () => ({
  getProfileById: jest.fn(),
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
const mockedGetProfileById = getProfileById as jest.MockedFunction<
  typeof getProfileById
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
    mockedGetProfileById.mockResolvedValue({
      id: "user-1",
      fullName: "홍길동",
      email: "reader@example.com",
      avatarUrl: "https://example.com/avatar.png",
    })
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

    const ui = await ProfileSettingsPage({
      params: buildParams("user-1"),
    })
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

    const ui = await ProfileSettingsPage({
      params: buildParams("user-1"),
    })
    render(ui)

    expect(
      screen.getByText("아직 기록이 없어요"),
    ).toBeInTheDocument()
    expect(screen.getByTestId("history-empty")).toBeInTheDocument()
  })

  it("hides analysis prompt when history is sufficient", async () => {
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

    const ui = await ProfileSettingsPage({
      params: buildParams("user-1"),
    })
    render(ui)

    expect(
      screen.queryByText("히스토리를 5개 적으면 사용자 분석을 할 수 있어요"),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole("button", { name: "사용자 분석 열기" }),
    ).not.toBeInTheDocument()
  })

  it("renders profile when viewer is not authenticated", async () => {
    mockedGetCurrentUser.mockResolvedValue(null)
    mockedListReadingEntries.mockResolvedValue({
      success: true,
      data: [],
    })

    const ui = await ProfileSettingsPage({
      params: buildParams("user-1"),
    })
    render(ui)

    expect(screen.getByText("홍길동")).toBeInTheDocument()
    expect(screen.getByText("reader@example.com")).toBeInTheDocument()
    expect(screen.queryByTestId("profile-edit-modal")).not.toBeInTheDocument()
  })

  it("calls notFound when userId is missing", async () => {
    mockedListReadingEntries.mockResolvedValue({
      success: true,
      data: [],
    })

    await ProfileSettingsPage({
      params: buildParams(undefined),
    })

    expect(mockedNotFound).toHaveBeenCalled()
  })
})
