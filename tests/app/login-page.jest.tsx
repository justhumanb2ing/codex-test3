import { render, screen } from "@testing-library/react"

import LoginPage from "@/app/(auth)/login/page"

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, ...props }: { children: React.ReactNode }) => (
    <a {...props}>{children}</a>
  ),
}))

jest.mock("@/components/auth/kakao-login-button", () => ({
  KakaoLoginButton: () => (
    <button type="button">카카오 계정으로 계속</button>
  ),
}))

jest.mock("@/app/(auth)/actions", () => ({
  loginAction: jest.fn(async () => ({ error: undefined })),
}))

describe("LoginPage", () => {
  it("renders form fields", async () => {
    const ui = await LoginPage({})
    render(ui)

    expect(screen.getByLabelText("이메일")).toBeInTheDocument()
    expect(screen.getByLabelText("비밀번호")).toBeInTheDocument()
    expect(
      screen.getAllByRole("button", { name: "로그인" }).length,
    ).toBeGreaterThan(0)
    expect(
      screen.getByRole("button", { name: "카카오 계정으로 계속" }),
    ).toBeInTheDocument()
  })

  it("shows error message when searchParams.error is present", async () => {
    const ui = await LoginPage({ searchParams: { error: "로그인 실패" } })
    render(ui)

    expect(screen.getByText("로그인 실패")).toBeInTheDocument()
  })

  it("shows success message when searchParams.success is present", async () => {
    const ui = await LoginPage({ searchParams: { success: "회원가입 완료" } })
    render(ui)

    expect(screen.getByText("회원가입 완료")).toBeInTheDocument()
  })
})
