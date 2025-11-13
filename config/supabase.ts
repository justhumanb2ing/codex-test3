import "server-only"

import { createServerClient, type CookieOptions } from "@supabase/ssr"
import type { SupabaseClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"

type CookieStore = Awaited<ReturnType<typeof cookies>>
type CookieSetterArgs = Parameters<CookieStore["set"]>

export interface SupabaseClientFactoryOptions {
  cookieStore?: CookieStore
  cookieSetter?: {
    set: (...args: CookieSetterArgs) => void
  }
}

const missingEnvMessage =
  "Supabase 환경 변수가 설정되지 않았습니다. .env.example을 참고해 NEXT_PUBLIC_SUPABASE_URL과 NEXT_PUBLIC_SUPABASE_ANON_KEY 값을 추가해주세요."

const getSupabaseUrl = () => {
  const value = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!value) {
    throw new Error(missingEnvMessage)
  }
  return value
}

const getSupabaseAnonKey = () => {
  const value = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!value) {
    throw new Error(missingEnvMessage)
  }
  return value
}

const buildCookieAdapter = (
  cookieStore: CookieStore,
  cookieSetter?: SupabaseClientFactoryOptions["cookieSetter"],
) => ({
  getAll() {
    return cookieStore
      .getAll()
      .map((cookie) => ({ name: cookie.name, value: cookie.value }))
  },
  async setAll(cookiesToSet: {
    name: string
    value: string
    options: CookieOptions
  }[]) {
    if (!cookieSetter?.set) {
      return
    }

    cookiesToSet.forEach(({ name, value, options }) => {
      cookieSetter.set({ name, value, ...(options ?? {}) })
    })
  },
})

/**
 * 생성된 Supabase Server Client를 반환합니다.
 * 쿠키 스토어를 사용하여 세션 정보를 자동으로 동기화합니다.
 */
export const createSupabaseServerClient = async (
  options: SupabaseClientFactoryOptions = {},
): Promise<SupabaseClient> => {
  const cookieStore = options.cookieStore ?? (await cookies())

  return createServerClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    cookies: buildCookieAdapter(cookieStore, options.cookieSetter),
  })
}
