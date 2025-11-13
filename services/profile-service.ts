import "server-only"

import { createSupabaseServerClient } from "@/config/supabase"

export interface UpdateProfileInput {
  fullName?: string
  avatarUrl?: string
}

export interface ProfileUpdateResult {
  success: boolean
  error?: string
}

export const updateUserProfile = async (
  input: UpdateProfileInput,
): Promise<ProfileUpdateResult> => {
  const data: Record<string, string> = {}

  if (typeof input.fullName === "string") {
    data.full_name = input.fullName
  }

  if (typeof input.avatarUrl === "string") {
    data.avatar_url = input.avatarUrl
  }

  if (Object.keys(data).length === 0) {
    return { success: true }
  }

  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.auth.updateUser({ data })

  if (error) {
    return {
      success: false,
      error: error.message,
    }
  }

  return { success: true }
}
