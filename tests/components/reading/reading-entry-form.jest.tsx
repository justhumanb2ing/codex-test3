import { render, screen } from "@testing-library/react"

import { ReadingEntryForm } from "@/components/reading/reading-entry-form"

jest.mock("@/app/(protected)/reading/actions", () => ({
  createReadingEntryAction: jest.fn(async () => ({ error: undefined })),
}))

describe("ReadingEntryForm", () => {
  it("renders required fields", () => {
    render(<ReadingEntryForm />)

    expect(screen.getByLabelText("책 제목")).toBeInTheDocument()
    expect(screen.getByLabelText("감상문")).toBeInTheDocument()
    expect(screen.getByLabelText("키워드 (쉼표로 구분)")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "기록 저장" })).toBeInTheDocument()
  })

  it("shows initial error message when provided", () => {
    render(<ReadingEntryForm initialErrorMessage="저장에 실패했습니다." />)

    expect(screen.getByRole("alert")).toHaveTextContent("저장에 실패했습니다.")
  })
})
