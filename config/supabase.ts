
import { auth } from "@clerk/nextjs/server"
import { createClient, type SupabaseClient } from "@supabase/supabase-js"

export const createServerSupabaseClient = async (): Promise<SupabaseClient> => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      accessToken: async () => (await auth()).getToken() ?? null,
    },
  )
}

let serviceRoleClient: SupabaseClient | null = null

export const createServiceRoleSupabaseClient = async (): Promise<SupabaseClient> => {
  if (serviceRoleClient) {
    return serviceRoleClient
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey) {
    throw new Error("Supabase service role 환경 변수가 설정되어야 합니다.")
  }

  serviceRoleClient = createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  return serviceRoleClient
}
