import { render, screen } from "@testing-library/react"

import LogoutPage from "@/app/(auth)/logout/page"

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, ...props }: { children: React.ReactNode }) => (
    <a {...props}>{children}</a>
  ),
}))

jest.mock("@/app/(auth)/actions", () => ({
  signOutAction: jest.fn(),
}))

describe("LogoutPage", () => {
  it("renders logout button and hidden inputs", async () => {
    const ui = await LogoutPage({})
    render(ui)

    expect(
      screen.getByRole("button", { name: "지금 로그아웃하기" }),
    ).toBeInTheDocument()
    const redirectInput = screen.getByDisplayValue("/")
    expect(redirectInput).toHaveAttribute("name", "redirectTo")
  })

  it("displays error message when provided", async () => {
    const ui = await LogoutPage({ searchParams: { error: "로그아웃 실패" } })
    render(ui)

    expect(screen.getByText("로그아웃 실패")).toBeInTheDocument()
  })
})
