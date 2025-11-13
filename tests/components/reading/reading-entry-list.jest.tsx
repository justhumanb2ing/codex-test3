import { fireEvent, render, screen, waitFor, within } from "@testing-library/react"

import { deleteReadingEntryAction } from "@/app/(protected)/reading/actions"
import { ReadingEntryList } from "@/components/reading/reading-entry-list"

jest.mock("@/app/(protected)/reading/actions", () => ({
  deleteReadingEntryAction: jest.fn(),
}))

jest.mock("@/components/ui/dropdown-menu", () => {
  return {
    DropdownMenu: ({ children }: any) => <div>{children}</div>,
    DropdownMenuTrigger: ({ children }: any) => <div>{children}</div>,
    DropdownMenuContent: ({ children }: any) => <div>{children}</div>,
    DropdownMenuItem: ({ children, onSelect }: any) => (
      <button type="button" onClick={onSelect}>
        {children}
      </button>
    ),
  }
})

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

  it("renders entry details with topics", () => {
    render(
      <ReadingEntryList
        entries={[
          {
            id: "entry-1",
            userId: "user-1",
            bookTitle: "데미안",
            content: "긴 감상문",
            userKeywords: ["성장"],
            aiSummary: "싱클레어의 성장 이야기",
            aiEmotions: [],
            aiTopics: [
              { id: "topic-1", value: "성장", weight: 1 },
              { id: "topic-2", value: "우정", weight: 0.5 },
            ],
            createdAt: "2024-05-01T10:00:00.000Z",
          },
        ]}
      />,
    )

    expect(screen.getByRole("link", { name: /데미안/ })).toHaveAttribute(
      "href",
      "/reading/entry-1",
    )
    expect(screen.getByText("싱클레어의 성장 이야기")).toBeInTheDocument()
    expect(screen.getByText("성장")).toBeInTheDocument()
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
            aiSummary: "요약",
            aiEmotions: [],
            aiTopics: [],
            createdAt: "2024-05-01T10:00:00.000Z",
          },
          {
            id: "entry-2",
            userId: "user-1",
            bookTitle: "작별하지 않는다",
            content: "감상2",
            userKeywords: [],
            aiSummary: "요약2",
            aiEmotions: [],
            aiTopics: [],
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
