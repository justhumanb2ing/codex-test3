import { type ReactNode } from "react";

import { render, screen } from "@testing-library/react";

import { NavigationDropdown } from "@/components/layout/navigation-dropdown";

jest.mock("@/components/ui/dropdown-menu", () => ({
  DropdownMenu: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DropdownMenuTrigger: ({ children }: { children: ReactNode }) => (
    <>{children}</>
  ),
  DropdownMenuContent: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),
  DropdownMenuLabel: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),
  DropdownMenuSeparator: () => <hr />,
  DropdownMenuItem: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

describe("NavigationDropdown", () => {
  it("renders trigger button and logout link", () => {
    render(<NavigationDropdown />);

    expect(
      screen.getByRole("button", { name: "사용자 메뉴 열기" })
    ).toBeInTheDocument();

    const logoutLink = screen.getByRole("link", { name: "로그아웃" });
    expect(logoutLink).toHaveAttribute("href", "/logout");
  });
});
