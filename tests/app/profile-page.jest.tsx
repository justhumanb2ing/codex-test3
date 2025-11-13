import { render, screen } from "@testing-library/react"

import ProfileSettingsPage from "@/app/(protected)/profile/page"
import { getCurrentUser } from "@/services/auth-service"
import { redirect } from "next/navigation"

jest.mock("next/navigation", () => ({
  redirect: jest.fn(),
}))

jest.mock("@/services/auth-service", () => ({
  getCurrentUser: jest.fn(),
}))

jest.mock("@/components/profile/profile-edit-modal", () => ({
  ProfileEditModal: () => <div data-testid="profile-edit-modal" />,
}))

const mockedGetCurrentUser = getCurrentUser as jest.MockedFunction<
  typeof getCurrentUser
>
const mockedRedirect = redirect as jest.MockedFunction<typeof redirect>

describe("ProfileSettingsPage", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockedRedirect.mockImplementation(() => undefined as never)
  })

  it("renders profile information when user exists", async () => {
    mockedGetCurrentUser.mockResolvedValue({
      id: "user-1",
      email: "reader@example.com",
      user_metadata: {
        full_name: "홍길동",
      },
    } as never)

    const ui = await ProfileSettingsPage()
    render(ui)

    expect(screen.getByText("홍길동")).toBeInTheDocument()
    expect(screen.getByText("reader@example.com")).toBeInTheDocument()
    expect(screen.getByText("독서 히스토리 시각화")).toBeInTheDocument()
    expect(screen.getByText("업적 및 배지")).toBeInTheDocument()
    expect(screen.getByText("사용자 분석")).toBeInTheDocument()
  })

  it("redirects to login when user is missing", async () => {
    mockedGetCurrentUser.mockResolvedValue(null)

    await ProfileSettingsPage()

    expect(mockedRedirect).toHaveBeenCalledWith("/login")
  })
})
