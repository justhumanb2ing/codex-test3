import NewReadingEntryPage from "@/app/(protected)/reading/new/page"
import { redirect } from "next/navigation"

jest.mock("next/navigation", () => ({
  redirect: jest.fn(),
}))

const mockedRedirect = redirect as jest.MockedFunction<typeof redirect>

describe("NewReadingEntryPage", () => {
  it("redirects to reading page with compose query", () => {
    mockedRedirect.mockImplementation(() => undefined as never)

    NewReadingEntryPage()

    expect(mockedRedirect).toHaveBeenCalledWith("/reading?compose=new")
  })
})
