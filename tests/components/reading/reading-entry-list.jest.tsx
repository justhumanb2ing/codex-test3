import { render, screen } from "@testing-library/react"

import { ReadingEntryList } from "@/components/reading/reading-entry-list"

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

    expect(screen.getByRole("link", { name: "데미안" })).toBeInTheDocument()
    expect(screen.getByText("싱클레어의 성장 이야기")).toBeInTheDocument()
    expect(screen.getByText("성장")).toBeInTheDocument()
  })
})
