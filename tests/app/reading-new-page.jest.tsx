import { render, screen } from "@testing-library/react"

import NewReadingEntryPage from "@/app/(protected)/reading/new/page"

jest.mock("@/components/reading/reading-entry-form", () => ({
  ReadingEntryForm: () => <form aria-label="reading-entry-form" />,
}))

describe("NewReadingEntryPage", () => {
  it("renders heading and form", () => {
    render(<NewReadingEntryPage />)

    expect(screen.getByText("독서 기록 작성")).toBeInTheDocument()
    expect(screen.getByLabelText("reading-entry-form")).toBeInTheDocument()
  })
})
