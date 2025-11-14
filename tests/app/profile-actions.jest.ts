import { updateProfileAction } from "@/app/(protected)/profile/actions"
import { getCurrentUser } from "@/services/auth-service"
import { uploadProfileImage } from "@/services/profile-image-service"
import { updateUserProfile } from "@/services/profile-service"
import { revalidatePath } from "next/cache"

jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}))

jest.mock("@/services/auth-service", () => ({
  getCurrentUser: jest.fn(),
}))

jest.mock("@/services/profile-image-service", () => ({
  uploadProfileImage: jest.fn(),
}))

jest.mock("@/services/profile-service", () => ({
  updateUserProfile: jest.fn(),
}))

const mockedGetCurrentUser = getCurrentUser as jest.MockedFunction<
  typeof getCurrentUser
>
const mockedUploadProfileImage = uploadProfileImage as jest.MockedFunction<
  typeof uploadProfileImage
>
const mockedUpdateUserProfile = updateUserProfile as jest.MockedFunction<
  typeof updateUserProfile
>
const mockedRevalidatePath = revalidatePath as jest.MockedFunction<
  typeof revalidatePath
>

describe("updateProfileAction", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockedRevalidatePath.mockImplementation(() => undefined)
  })

  it("returns error when user is not authenticated", async () => {
    mockedGetCurrentUser.mockResolvedValue(null)

    const state = await updateProfileAction(undefined, new FormData())

    expect(state).toEqual({ error: "로그인이 필요한 기능입니다." })
  })

  it("updates profile without avatar change", async () => {
    mockedGetCurrentUser.mockResolvedValue({
      id: "user-1",
      email: "user@example.com",
    } as never)
    mockedUpdateUserProfile.mockResolvedValue({ success: true })

    const formData = new FormData()
    formData.set("fullName", "홍길동")
    formData.set("currentAvatar", "https://example.com/avatar.png")

    const state = await updateProfileAction(undefined, formData)

    expect(state).toEqual({ success: true })
    expect(mockedUpdateUserProfile).toHaveBeenCalledWith({
      userId: "user-1",
      fullName: "홍길동",
      avatarUrl: "https://example.com/avatar.png",
      email: "user@example.com",
    })
    expect(mockedUploadProfileImage).not.toHaveBeenCalled()
    expect(mockedRevalidatePath).toHaveBeenCalled()
  })

  it("uploads avatar when file exists", async () => {
    mockedGetCurrentUser.mockResolvedValue({
      id: "user-1",
      email: "user@example.com",
    } as never)
    mockedUpdateUserProfile.mockResolvedValue({ success: true })
    mockedUploadProfileImage.mockResolvedValue("https://cdn/avatar.png")

    const file = new File(["hello"], "avatar.png", { type: "image/png" })
    const formData = new FormData()
    formData.set("fullName", "홍길동")
    formData.set("avatar", file)

    const state = await updateProfileAction(undefined, formData)

    expect(state).toEqual({ success: true })
    expect(mockedUploadProfileImage).toHaveBeenCalled()
    expect(mockedUpdateUserProfile).toHaveBeenCalledWith({
      userId: "user-1",
      fullName: "홍길동",
      avatarUrl: "https://cdn/avatar.png",
      email: "user@example.com",
    })
  })

  it("returns error when upload fails", async () => {
    mockedGetCurrentUser.mockResolvedValue({
      id: "user-1",
      email: "user@example.com",
    } as never)
    mockedUploadProfileImage.mockRejectedValue(new Error("업로드 실패"))

    const file = new File(["hello"], "avatar.png", { type: "image/png" })
    const formData = new FormData()
    formData.set("fullName", "홍길동")
    formData.set("avatar", file)

    const state = await updateProfileAction(undefined, formData)

    expect(state).toEqual({ error: "업로드 실패" })
    expect(mockedUpdateUserProfile).not.toHaveBeenCalled()
  })

  it("returns error when update fails", async () => {
    mockedGetCurrentUser.mockResolvedValue({
      id: "user-1",
      email: "user@example.com",
    } as never)
    mockedUpdateUserProfile.mockResolvedValue({
      success: false,
      error: "DB 오류",
    })

    const formData = new FormData()
    formData.set("fullName", "홍길동")

    const state = await updateProfileAction(undefined, formData)

    expect(state).toEqual({ error: "DB 오류" })
  })

  it("allows empty name updates when not provided", async () => {
    mockedGetCurrentUser.mockResolvedValue({
      id: "user-1",
      email: "user@example.com",
    } as never)
    mockedUpdateUserProfile.mockResolvedValue({ success: true })

    const formData = new FormData()
    formData.set("currentAvatar", "")

    const state = await updateProfileAction(undefined, formData)

    expect(state).toEqual({ success: true })
    expect(mockedUpdateUserProfile).toHaveBeenCalledWith({
      userId: "user-1",
      fullName: undefined,
      avatarUrl: undefined,
      email: "user@example.com",
    })
  })
})
