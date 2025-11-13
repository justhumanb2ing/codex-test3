import "server-only"

import { createSupabaseServerClient } from "@/config/supabase"

import type { ReadingEmotion, ReadingTopic } from "./reading-insight-service"

export interface ReadingEntry {
  id: string
  userId: string
  bookTitle: string
  content: string
  userKeywords: string[]
  aiSummary: string
  aiEmotions: ReadingEmotion[]
  aiTopics: ReadingTopic[]
  createdAt: string
}

export interface CreateReadingEntryInput {
  userId: string
  bookTitle: string
  content: string
  userKeywords: string[]
  aiSummary: string
  aiEmotions: ReadingEmotion[]
  aiTopics: ReadingTopic[]
}

export interface ReadingLogResult<T> {
  success: boolean
  data?: T
  error?: string
}

const TABLE_NAME = "reading_entries"
const DEFAULT_ERROR_MESSAGE = "독서 기록을 처리하는 중 문제가 발생했습니다."

interface ReadingEntryRow {
  id: string
  user_id: string
  book_title: string
  content: string
  user_keywords: string[]
  ai_summary: string
  ai_emotions: ReadingEmotion[]
  ai_topics: ReadingTopic[]
  created_at: string
}

const mapRowToEntry = (row: ReadingEntryRow): ReadingEntry => ({
  id: row.id,
  userId: row.user_id,
  bookTitle: row.book_title,
  content: row.content,
  userKeywords: row.user_keywords,
  aiSummary: row.ai_summary,
  aiEmotions: row.ai_emotions,
  aiTopics: row.ai_topics,
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
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .insert({
      user_id: input.userId,
      book_title: input.bookTitle,
      content: input.content,
      user_keywords: input.userKeywords,
      ai_summary: input.aiSummary,
      ai_emotions: input.aiEmotions,
      ai_topics: input.aiTopics,
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
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select()
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error || !data) {
    return buildErrorResult(error?.message)
  }

  return {
    success: true,
    data: (data as ReadingEntryRow[]).map(mapRowToEntry),
  }
}

/**
 * 지정된 독서 기록을 조회합니다. 소유자가 아닐 경우 null을 반환합니다.
 */
export const getReadingEntry = async (
  userId: string,
  entryId: string,
): Promise<ReadingLogResult<ReadingEntry | null>> => {
  const supabase = await createSupabaseServerClient()
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

  return {
    success: true,
    data: mapRowToEntry(data as ReadingEntryRow),
  }
}

/**
 * 독서 기록을 삭제합니다. 성공 여부만 반환합니다.
 */
export const deleteReadingEntry = async (
  userId: string,
  entryId: string,
): Promise<ReadingLogResult<null>> => {
  const supabase = await createSupabaseServerClient()
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
