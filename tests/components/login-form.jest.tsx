import { render, screen } from "@testing-library/react"

import { LoginForm } from "@/components/auth/login-form"

jest.mock("@/app/(auth)/actions", () => ({
  loginAction: jest.fn(async () => ({ error: undefined })),
}))

describe("LoginForm", () => {
  it("surfaces initial error message above the button", () => {
    render(<LoginForm initialErrorMessage="오류가 발생했습니다." />)

    const message = screen.getByRole("alert")
    expect(message).toHaveTextContent("오류가 발생했습니다.")
    expect(
      screen.getByRole("button", { name: "로그인" }),
    ).toBeInTheDocument()
  })
})
