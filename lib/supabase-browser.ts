import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export const createBrowserSupabaseClient = (
  getToken: () => Promise<string | null>
): SupabaseClient => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      accessToken: async () => getToken() ?? null,
    }
  );
};
