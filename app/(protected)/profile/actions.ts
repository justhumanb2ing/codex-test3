"use server"

import { revalidatePath } from "next/cache"

import { getCurrentUser } from "@/services/auth-service"
import { uploadProfileImage } from "@/services/profile-image-service"
import { updateUserProfile } from "@/services/profile-service"

export interface UpdateProfileActionState {
  error?: string
  success?: boolean
}

const initialState: UpdateProfileActionState = {
  error: undefined,
  success: false,
}

const readField = (formData: FormData, key: string) => {
  const value = formData.get(key)
  return typeof value === "string" ? value.trim() : ""
}

export const updateProfileAction = async (
  _prevState: UpdateProfileActionState = initialState,
  formData: FormData,
): Promise<UpdateProfileActionState> => {
  const user = await getCurrentUser()

  if (!user) {
    return { error: "로그인이 필요한 기능입니다." }
  }

  const fullName = readField(formData, "fullName")
  const currentAvatarValue = readField(formData, "currentAvatar")
  const file = formData.get("avatar")
  let avatarUrl = currentAvatarValue || undefined

  if (file instanceof File && file.size > 0) {
    try {
      avatarUrl = await uploadProfileImage(user.id, file)
    } catch (error) {
      return {
        error:
          error instanceof Error
            ? error.message
            : "프로필 이미지를 업로드하지 못했습니다.",
      }
    }
  }

  const updateResult = await updateUserProfile({
    fullName: fullName || undefined,
    avatarUrl,
  })

  if (!updateResult.success) {
    return {
      error:
        updateResult.error ?? "프로필을 업데이트하는 중 문제가 발생했습니다.",
    }
  }

  revalidatePath("/profile")
  revalidatePath("/", "layout")

  return { success: true }
}
