import { type ReactNode } from "react"

import { fireEvent, render, screen, waitFor, within } from "@testing-library/react"

import { deleteReadingEntryAction } from "@/app/(protected)/reading/actions"
import { ReadingEntryList } from "@/components/reading/reading-entry-list"

jest.mock("@/app/(protected)/reading/actions", () => ({
  deleteReadingEntryAction: jest.fn(),
}))

jest.mock("@/components/ui/dropdown-menu", () => ({
  DropdownMenu: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DropdownMenuTrigger: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),
  DropdownMenuContent: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),
  DropdownMenuItem: ({
    children,
    onSelect,
  }: {
    children: ReactNode
    onSelect?: () => void
  }) => (
    <button type="button" onClick={onSelect}>
      {children}
    </button>
  ),
}))

const mockedDeleteReadingEntryAction =
  deleteReadingEntryAction as jest.MockedFunction<
    typeof deleteReadingEntryAction
  >

describe("ReadingEntryList", () => {
  it("renders empty state when no entries", () => {
    render(<ReadingEntryList entries={[]} />)

    expect(
      screen.getByText("아직 작성한 독서 기록이 없습니다. 첫 감상을 남겨보세요!"),
    ).toBeInTheDocument()
  })

  it("renders entry details with keywords", () => {
    render(
      <ReadingEntryList
        entries={[
          {
            id: "entry-1",
            userId: "user-1",
            bookTitle: "데미안",
            content: "긴 감상문",
            userKeywords: ["성장"],
            createdAt: "2024-05-01T10:00:00.000Z",
          },
        ]}
      />,
    )

    expect(screen.getByText("데미안")).toBeInTheDocument()
    expect(screen.getByText("긴 감상문")).toBeInTheDocument()
    expect(screen.getByText("#성장")).toBeInTheDocument()
  })

  it("removes an entry after confirming deletion", async () => {
    mockedDeleteReadingEntryAction.mockResolvedValue({ success: true })

    render(
      <ReadingEntryList
        entries={[
          {
            id: "entry-1",
            userId: "user-1",
            bookTitle: "데미안",
            content: "감상",
            userKeywords: [],
            createdAt: "2024-05-01T10:00:00.000Z",
          },
          {
            id: "entry-2",
            userId: "user-1",
            bookTitle: "작별하지 않는다",
            content: "감상2",
            userKeywords: [],
            createdAt: "2024-05-02T10:00:00.000Z",
          },
        ]}
      />,
    )

    fireEvent.click(screen.getAllByRole("button", { name: "삭제" })[0])

    const dialog = await screen.findByRole("alertdialog")
    expect(
      within(dialog).getByText(/"데미안"에 대한 감상을 삭제하면/),
    ).toBeInTheDocument()

    fireEvent.click(within(dialog).getByRole("button", { name: "삭제" }))

    await waitFor(() =>
      expect(mockedDeleteReadingEntryAction).toHaveBeenCalledWith("entry-1"),
    )

    await waitFor(() =>
      expect(screen.queryByText("데미안")).not.toBeInTheDocument(),
    )
    expect(screen.getByText("작별하지 않는다")).toBeInTheDocument()
  })
})
