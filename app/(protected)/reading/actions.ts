"use server"

import { redirect } from "next/navigation"

import { getCurrentUser } from "@/services/auth-service"
import {
  createReadingEntry,
  type CreateReadingEntryInput,
  type ReadingLogResult,
  deleteReadingEntry,
} from "@/services/reading-log-service"

export interface CreateReadingEntryActionState {
  error?: string
}

const initialState: CreateReadingEntryActionState = {
  error: undefined,
}

const readField = (formData: FormData, key: string) => {
  const value = formData.get(key)
  return typeof value === "string" ? value.trim() : ""
}

const parseKeywords = (rawValue: string): string[] => {
  if (!rawValue) {
    return []
  }

  return rawValue
    .split(",")
    .map((keyword) => keyword.trim())
    .filter((keyword, index, array) => keyword.length > 0 && array.indexOf(keyword) === index)
}

const handleCreationError = (
  result: ReadingLogResult<unknown>,
): CreateReadingEntryActionState => ({
  error: result.error ?? "기록을 저장하는 중 오류가 발생했습니다.",
})

/**
 * 사용자가 제출한 독서 기록을 저장하고 상세 페이지로 이동합니다.
 */
export const createReadingEntryAction = async (
  _prevState: CreateReadingEntryActionState = initialState,
  formData: FormData,
): Promise<CreateReadingEntryActionState | void> => {
  const bookTitle = readField(formData, "bookTitle")
  const content = readField(formData, "content")
  const keywords = parseKeywords(readField(formData, "keywords"))

  if (!bookTitle || !content) {
    return {
      error: "책 제목과 감상문을 모두 입력해주세요.",
    }
  }

  const user = await getCurrentUser()

  if (!user) {
    return {
      error: "로그인이 필요한 기능입니다.",
    }
  }

  const payload: CreateReadingEntryInput = {
    userId: user.id,
    bookTitle,
    content,
    userKeywords: keywords,
  }
  const result = await createReadingEntry(payload)

  if (!result.success || !result.data) {
    return handleCreationError(result)
  }

  redirect(`/reading/${result.data.id}`)
}

export interface DeleteReadingEntryActionResult {
  success: boolean
  error?: string
}

const DELETE_ERROR_MESSAGE = "기록을 삭제하는 중 문제가 발생했습니다."

/**
 * 현재 사용자의 독서 기록을 삭제합니다.
 */
export const deleteReadingEntryAction = async (
  entryId: string,
): Promise<DeleteReadingEntryActionResult> => {
  if (!entryId) {
    return {
      success: false,
      error: "삭제할 기록을 찾을 수 없습니다.",
    }
  }

  const user = await getCurrentUser()

  if (!user) {
    return {
      success: false,
      error: "로그인이 필요한 기능입니다.",
    }
  }

  const result = await deleteReadingEntry(user.id, entryId)

  if (!result.success) {
    return {
      success: false,
      error: result.error ?? DELETE_ERROR_MESSAGE,
    }
  }

  return { success: true }
}
