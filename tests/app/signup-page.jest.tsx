import { type ReactNode } from "react"

import { render, screen } from "@testing-library/react"

import SignupPage from "@/app/(auth)/sign-up/[[...sign-up]]/page"

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, ...props }: { children: ReactNode }) => (
    <a {...props}>{children}</a>
  ),
}))

jest.mock("@clerk/nextjs", () => ({
  SignUp: () => <div data-testid="clerk-sign-up">Clerk SignUp</div>,
}))

describe("SignupPage", () => {
  it("renders Clerk SignUp widget", () => {
    render(<SignupPage />)

    expect(screen.getByTestId("clerk-sign-up")).toBeInTheDocument()
    expect(screen.getByText("로그인")).toHaveAttribute("href", "/sign-in")
  })
})
