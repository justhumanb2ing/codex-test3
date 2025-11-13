import { render, screen } from "@testing-library/react"

import { ReadingEntrySummary } from "@/components/reading/reading-entry-summary"

describe("ReadingEntrySummary", () => {
  it("renders summary, emotions and topics", () => {
    render(
      <ReadingEntrySummary
        summary="주인공의 성장과 화해에 관한 이야기"
        emotions={[
          { id: "emotion-1", label: "긍정", score: 0.8, context: "요약" },
        ]}
        topics={[
          { id: "topic-1", value: "성장", weight: 1 },
          { id: "topic-2", value: "우정", weight: 0.6 },
        ]}
      />,
    )

    expect(screen.getByText("주인공의 성장과 화해에 관한 이야기")).toBeInTheDocument()
    expect(screen.getByText("긍정")).toBeInTheDocument()
    expect(screen.getAllByText(/성장/)[0]).toBeInTheDocument()
    expect(screen.getAllByText(/우정/)[0]).toBeInTheDocument()
  })

  it("renders fallback messages when insights are empty", () => {
    render(<ReadingEntrySummary summary="" emotions={[]} topics={[]} />)

    expect(screen.getByText("감정 분석 결과가 없습니다.")).toBeInTheDocument()
    expect(screen.getByText("주제 태그가 없습니다.")).toBeInTheDocument()
  })
})
