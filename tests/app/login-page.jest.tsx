import { type ReactNode } from "react"

import { render, screen } from "@testing-library/react"

import LoginPage from "@/app/(auth)/sign-in/[[...sign-in]]/page"

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, ...props }: { children: ReactNode }) => (
    <a {...props}>{children}</a>
  ),
}))

jest.mock("@clerk/nextjs", () => ({
  SignIn: () => <div data-testid="clerk-sign-in">Clerk SignIn</div>,
}))

describe("LoginPage", () => {
  it("renders Clerk SignIn widget", () => {
    render(<LoginPage />)

    expect(screen.getByTestId("clerk-sign-in")).toBeInTheDocument()
    expect(screen.getByText("회원가입")).toHaveAttribute("href", "/sign-up")
  })
})
