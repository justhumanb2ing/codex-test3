const missingEnvMessage =
  "Supabase 환경 변수가 설정되지 않았습니다. .env.example을 참고해 NEXT_PUBLIC_SUPABASE_URL과 NEXT_PUBLIC_SUPABASE_ANON_KEY 값을 추가해주세요."

const getEnv = (key: string, fallbackError?: string) => {
  const value = process.env[key]
  if (!value) {
    throw new Error(fallbackError ?? missingEnvMessage)
  }
  return value
}

export const getSupabaseUrl = () => getEnv("NEXT_PUBLIC_SUPABASE_URL")

export const getSupabaseAnonKey = () =>
  getEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", missingEnvMessage)

export const getSupabaseServiceRoleKey = () =>
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? getSupabaseAnonKey()

export const getClerkSupabaseTemplateName = () =>
  process.env.CLERK_SUPABASE_TEMPLATE_NAME ?? "supabase"
