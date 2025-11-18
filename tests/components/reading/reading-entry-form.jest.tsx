import { render, screen } from "@testing-library/react"

import { ReadingEntryForm } from "@/components/reading/reading-entry-form"

jest.mock("@/app/(protected)/reading/actions", () => ({
  createReadingEntryAction: jest.fn(async () => ({ error: undefined })),
}))

describe("ReadingEntryForm", () => {
  it("renders required fields", () => {
    render(<ReadingEntryForm currentUserName="홍길동" />)

    expect(screen.getByLabelText("책 제목")).toBeInTheDocument()
    expect(screen.getByLabelText("감상문")).toBeInTheDocument()
    expect(
      screen.getByLabelText("홍길동 > 책 추가"),
    ).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "게시" })).toBeInTheDocument()
  })

  it("shows initial error message when provided", () => {
    render(
      <ReadingEntryForm
        currentUserName="홍길동"
        initialErrorMessage="저장에 실패했습니다."
      />,
    )

    expect(screen.getByRole("alert")).toHaveTextContent("저장에 실패했습니다.")
  })
})
