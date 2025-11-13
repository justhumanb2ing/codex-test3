import { render, screen } from "@testing-library/react"

import SignupPage from "@/app/(auth)/signup/page"

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

describe("SignupPage", () => {
  it("renders all required form fields", async () => {
    const ui = await SignupPage({})
    render(ui)

    expect(screen.getByLabelText("이메일")).toBeInTheDocument()
    expect(screen.getByLabelText("비밀번호")).toBeInTheDocument()
    expect(screen.getByLabelText("비밀번호 확인")).toBeInTheDocument()
    expect(
      screen.getAllByRole("button", { name: "회원가입" }).length,
    ).toBeGreaterThan(0)
    expect(
      screen.getByRole("button", { name: "카카오 계정으로 계속" }),
    ).toBeInTheDocument()
  })

  it("shows error message from search params", async () => {
    const ui = await SignupPage({ searchParams: { error: "에러 발생" } })
    render(ui)

    expect(screen.getByText("에러 발생")).toBeInTheDocument()
  })
})
