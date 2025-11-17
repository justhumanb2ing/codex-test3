import { getCurrentUser } from "@/services/auth-service"
import { currentUser } from "@clerk/nextjs/server"

jest.mock("@clerk/nextjs/server", () => ({
  currentUser: jest.fn(),
}))

const mockedCurrentUser = currentUser as jest.MockedFunction<typeof currentUser>

describe("auth-service with Clerk", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("returns normalized user data when Clerk session exists", async () => {
    mockedCurrentUser.mockResolvedValue({
      id: "user_1",
      username: "codex",
      fullName: "Codex Reader",
      firstName: "Codex",
      lastName: "Reader",
      imageUrl: "https://example.com/avatar.png",
      primaryEmailAddress: { emailAddress: "user@example.com" },
    } as never)

    await expect(getCurrentUser()).resolves.toEqual({
      id: "user_1",
      email: "user@example.com",
      firstName: "Codex",
      lastName: "Reader",
      user_metadata: {
        username: "codex",
        full_name: "Codex Reader",
        name: "Codex",
        nickname: "Reader",
        avatar_url: "https://example.com/avatar.png",
      },
    })
  })

  it("returns null when Clerk has no session", async () => {
    mockedCurrentUser.mockResolvedValue(null)
    await expect(getCurrentUser()).resolves.toBeNull()
  })

  it("swallows Clerk errors and returns null", async () => {
    mockedCurrentUser.mockRejectedValue(new Error("clerk error"))
    await expect(getCurrentUser()).resolves.toBeNull()
  })
})
