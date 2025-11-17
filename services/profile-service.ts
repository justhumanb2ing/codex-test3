
import { createServerSupabaseClient } from "@/config/supabase"

export interface UpdateProfileInput {
  userId: string
  fullName?: string
  avatarUrl?: string
  email?: string
}

export interface ProfileUpdateResult {
  success: boolean
  error?: string
}

export interface UserProfile {
  id: string
  fullName?: string
  avatarUrl?: string
  email?: string
}

export const updateUserProfile = async (
  input: UpdateProfileInput,
): Promise<ProfileUpdateResult> => {
  if (
    typeof input.fullName !== "string" &&
    typeof input.avatarUrl !== "string" &&
    typeof input.email !== "string"
  ) {
    return { success: true }
  }

  const supabase = await createServerSupabaseClient()

  const profilePayload: Record<string, string> = { id: input.userId }

  if (typeof input.fullName === "string") {
    profilePayload.full_name = input.fullName
  }

  if (typeof input.avatarUrl === "string") {
    profilePayload.avatar_url = input.avatarUrl
  }

  if (typeof input.email === "string") {
    profilePayload.email = input.email
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .upsert(profilePayload, { onConflict: "id" })

  if (profileError) {
    return {
      success: false,
      error: profileError.message,
    }
  }

  return { success: true }
}

export const getProfileById = async (
  userId: string,
): Promise<UserProfile | null> => {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url, email")
    .eq("id", userId)
    .single()

  if (error) {
    if (error.code === "PGRST116") {
      return null
    }
    throw new Error(error.message)
  }

  return {
    id: data.id,
    fullName: data.full_name ?? undefined,
    avatarUrl: data.avatar_url ?? undefined,
    email: data.email ?? undefined,
  }
}
