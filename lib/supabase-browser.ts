import { createClient, type SupabaseClient } from "@supabase/supabase-js"

let browserClient: SupabaseClient | null = null

export const getSupabaseBrowserClient = () => {
  if (browserClient) {
    return browserClient
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    throw new Error("Supabase 환경 변수가 설정되지 않았습니다.")
  }

  browserClient = createClient(url, anonKey, {
    auth: {
      persistSession: true,
    },
  })

  return browserClient
}
