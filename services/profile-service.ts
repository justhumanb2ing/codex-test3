import { createServerSupabaseClient } from "@/config/supabase";
import type { AppUser } from "@/services/auth-service";
import { buildProfileName } from "@/lib/profile-utils";

export interface UserProfile {
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  updatedAt?: string | null;
}

interface ProfileRow {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  updated_at: string | null;
}

const PROFILES_TABLE = "profiles";

const mapRowToProfile = (row: ProfileRow): UserProfile => ({
  userId: row.user_id,
  displayName: row.display_name ?? "이름 없는 사용자",
  avatarUrl: row.avatar_url,
  updatedAt: row.updated_at,
});

const resolveDisplayName = (user: AppUser) => {
  const composedName = [user.lastName, user.firstName]
    .filter((part) => part && part.length > 0)
    .join(" ")
    .trim();

  if (composedName.length > 0) {
    return composedName;
  }

  return buildProfileName(user.user_metadata ?? {}, user.email ?? undefined);
};

export const upsertProfileFromClerkUser = async (
  user: AppUser
): Promise<UserProfile | null> => {
  const supabase = await createServerSupabaseClient();
  const payload = {
    user_id: user.id,
    display_name: resolveDisplayName(user),
    avatar_url:
      (user.user_metadata?.avatar_url as string | undefined) ?? null,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from(PROFILES_TABLE)
    .upsert(payload, { onConflict: "user_id" })
    .select()
    .single();

  if (error || !data) {
    return null;
  }

  return mapRowToProfile(data as ProfileRow);
};

export const getProfileByUserId = async (
  userId: string
): Promise<UserProfile | null> => {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from(PROFILES_TABLE)
    .select()
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return mapRowToProfile(data as ProfileRow);
};

export const getProfilesByUserIds = async (
  userIds: string[]
): Promise<Record<string, UserProfile>> => {
  if (userIds.length === 0) {
    return {};
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from(PROFILES_TABLE)
    .select()
    .in("user_id", userIds);

  if (error || !data) {
    return {};
  }

  return (data as ProfileRow[]).reduce<Record<string, UserProfile>>(
    (acc, row) => {
      const profile = mapRowToProfile(row);
      acc[profile.userId] = profile;
      return acc;
    },
    {},
  );
};
