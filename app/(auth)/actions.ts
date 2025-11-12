"use server"

import { redirect } from "next/navigation"

import {
  signInWithEmail,
  signInWithKakao,
  signOutUser,
} from "@/services/auth-service"

const readPath = (
  formData: FormData,
  key: string,
  fallback: string,
): string => {
  const value = formData.get(key)
  if (!value || typeof value !== "string") {
    return fallback
  }
  return value
}

const buildErrorQuery = (message: string) => {
  const params = new URLSearchParams()
  params.set("error", message)
  return params.toString()
}

const readField = (formData: FormData, key: string) => {
  const value = formData.get(key)
  return typeof value === "string" ? value.trim() : ""
}

export interface LoginActionState {
  error?: string
}

const loginInitialState: LoginActionState = { error: undefined }

export const loginAction = async (
  _prevState: LoginActionState = loginInitialState,
  formData: FormData,
): Promise<LoginActionState> => {
  const email = readField(formData, "email")
  const password = readField(formData, "password")

  if (!email || !password) {
    return { error: "이메일과 비밀번호를 모두 입력해주세요." }
  }

  const result = await signInWithEmail({ email, password })

  if (!result.success) {
    return {
      error:
        result.error ??
        "로그인에 실패했습니다. 입력값을 다시 확인해주세요.",
    }
  }

  redirect("/")
}

export interface SocialLoginActionState {
  error?: string
}

const socialInitialState: SocialLoginActionState = {
  error: undefined,
}

export const kakaoLoginAction = async (
  _prevState: SocialLoginActionState = socialInitialState,
  formData: FormData,
): Promise<SocialLoginActionState> => {
  const nextPath = readPath(formData, "next", "/")
  const result = await signInWithKakao(nextPath)

  if (!result.success || !result.redirectUrl) {
    return {
      error: result.error ?? "카카오 로그인에 실패했습니다. 다시 시도해주세요.",
    }
  }

  redirect(result.redirectUrl)
}

/**
 * 서버 액션을 통해 사용자를 로그아웃합니다.
 * redirectTo와 errorRedirect 값을 hidden input으로 전달하여 라우팅을 제어할 수 있습니다.
 */
export const signOutAction = async (formData: FormData) => {
  const result = await signOutUser()

  if (!result.success) {
    const errorPath = readPath(formData, "errorRedirect", "/logout")
    redirect(
      `${errorPath}?${buildErrorQuery(
        result.error ?? "로그아웃 처리에 실패했습니다.",
      )}`,
    )
  }

  const redirectTo = readPath(formData, "redirectTo", "/")
  redirect(redirectTo)
}
