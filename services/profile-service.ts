import "server-only"

import { createSupabaseServerClient } from "@/config/supabase"

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
  const data: Record<string, string> = {}

  if (typeof input.fullName === "string") {
    data.full_name = input.fullName
    data.custom_full_name = input.fullName
  }

  if (typeof input.avatarUrl === "string") {
    data.avatar_url = input.avatarUrl
    data.custom_avatar_url = input.avatarUrl
  }

  const supabase = await createSupabaseServerClient()

  if (Object.keys(data).length > 0) {
    const { error } = await supabase.auth.updateUser({ data })

    if (error) {
      return {
        success: false,
        error: error.message,
      }
    }
  }

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

  if (Object.keys(profilePayload).length > 1) {
    const { error: profileError } = await supabase
      .from("profiles")
      .upsert(profilePayload, { onConflict: "id" })

    if (profileError) {
      return {
        success: false,
        error: profileError.message,
      }
    }
  }

  return { success: true }
}

export const getProfileById = async (
  userId: string,
): Promise<UserProfile | null> => {
  const supabase = await createSupabaseServerClient()
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
