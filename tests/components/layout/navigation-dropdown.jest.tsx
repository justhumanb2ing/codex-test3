import { type ReactNode } from "react"

import { render, screen } from "@testing-library/react"

import { NavigationDropdown } from "@/components/layout/navigation-dropdown"

jest.mock("@/components/ui/dropdown-menu", () => ({
  DropdownMenu: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DropdownMenuTrigger: ({ children }: { children: ReactNode }) => (
    <>{children}</>
  ),
  DropdownMenuContent: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),
  DropdownMenuItem: ({ children }: { children: ReactNode }) => <>{children}</>,
}))

jest.mock("@clerk/nextjs", () => ({
  SignOutButton: ({ children }: { children: ReactNode }) => (
    <div data-testid="sign-out-wrapper">{children}</div>
  ),
}))

describe("NavigationDropdown", () => {
  it("renders trigger button and sign out action", () => {
    render(<NavigationDropdown />)

    expect(
      screen.getByRole("button", { name: "사용자 메뉴 열기" }),
    ).toBeInTheDocument()
    expect(screen.getByTestId("sign-out-wrapper")).toHaveTextContent("로그아웃")
  })
})
