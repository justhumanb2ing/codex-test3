
import { createServerSupabaseClient } from "@/config/supabase"
import { getProfilesByUserIds } from "@/services/profile-service"

export interface ReadingEntry {
  id: string
  userId: string
  bookTitle: string
  content: string
  userKeywords: string[]
  createdAt: string
  authorName?: string | null
  authorAvatarUrl?: string | null
}

export interface CreateReadingEntryInput {
  userId: string
  bookTitle: string
  content: string
  userKeywords: string[]
}

export interface ReadingLogResult<T> {
  success: boolean
  data?: T
  error?: string
}

const TABLE_NAME = "record"
const DEFAULT_ERROR_MESSAGE = "독서 기록을 처리하는 중 문제가 발생했습니다."

interface ReadingEntryRow {
  id: string
  user_id: string
  book_title: string
  content: string
  user_keywords: string[]
  created_at: string
}

const mapRowToEntry = (row: ReadingEntryRow): ReadingEntry => ({
  id: row.id,
  userId: row.user_id,
  bookTitle: row.book_title,
  content: row.content,
  userKeywords: row.user_keywords,
  createdAt: row.created_at,
})

const buildErrorResult = <T>(error?: string): ReadingLogResult<T> => ({
  success: false,
  error: error ?? DEFAULT_ERROR_MESSAGE,
})

/**
 * 새로운 독서 기록을 생성하고 저장된 결과를 반환합니다.
 */
export const createReadingEntry = async (
  input: CreateReadingEntryInput,
): Promise<ReadingLogResult<ReadingEntry>> => {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .insert({
      user_id: input.userId,
      book_title: input.bookTitle,
      content: input.content,
      user_keywords: input.userKeywords,
    })
    .select()
    .single()

  if (error || !data) {
    return buildErrorResult(error?.message)
  }

  return {
    success: true,
    data: mapRowToEntry(data as ReadingEntryRow),
  }
}

/**
 * 현재 사용자에 대한 독서 기록 목록을 최신순으로 반환합니다.
 */
export const listReadingEntries = async (
  userId: string,
): Promise<ReadingLogResult<ReadingEntry[]>> => {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select()
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error || !data) {
    return buildErrorResult(error?.message)
  }

  const baseEntries = (data as ReadingEntryRow[]).map(mapRowToEntry)
  const uniqueUserIds = Array.from(new Set(baseEntries.map((entry) => entry.userId)))
  const profileMap = await getProfilesByUserIds(uniqueUserIds)

  return {
    success: true,
    data: baseEntries.map((entry) => ({
      ...entry,
      authorName: profileMap[entry.userId]?.displayName ?? null,
      authorAvatarUrl: profileMap[entry.userId]?.avatarUrl ?? null,
    })),
  }
}

/**
 * 지정된 독서 기록을 조회합니다. 소유자가 아닐 경우 null을 반환합니다.
 */
export const getReadingEntry = async (
  userId: string,
  entryId: string,
): Promise<ReadingLogResult<ReadingEntry | null>> => {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select()
    .eq("id", entryId)
    .eq("user_id", userId)
    .single()

  if (error) {
    if (error.code === "PGRST116") {
      return { success: true, data: null }
    }
    return buildErrorResult(error.message)
  }

  if (!data) {
    return { success: true, data: null }
  }

  const entry = mapRowToEntry(data as ReadingEntryRow)
  const profileMap = await getProfilesByUserIds([entry.userId])

  return {
    success: true,
    data: {
      ...entry,
      authorName: profileMap[entry.userId]?.displayName ?? null,
      authorAvatarUrl: profileMap[entry.userId]?.avatarUrl ?? null,
    },
  }
}

/**
 * 독서 기록을 삭제합니다. 성공 여부만 반환합니다.
 */
export const deleteReadingEntry = async (
  userId: string,
  entryId: string,
): Promise<ReadingLogResult<null>> => {
  const supabase = await createServerSupabaseClient()
  const { error } = await supabase
    .from(TABLE_NAME)
    .delete()
    .eq("id", entryId)
    .eq("user_id", userId)

  if (error) {
    return buildErrorResult(error.message)
  }

  return { success: true, data: null }
}

export const getReadingEntryCount = async (userId: string): Promise<number> => {
  const supabase = await createServerSupabaseClient()
  const { count, error } = await supabase
    .from(TABLE_NAME)
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)

  if (error) {
    return 0
  }

  return count ?? 0
}
