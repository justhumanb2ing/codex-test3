import { createServerSupabaseClient } from "@/config/supabase";
import type {
  AchievementDefinition,
  ProfileAchievement,
  UserAchievement,
  ActionAwardSummary,
  AchievementRule,
} from "@/services/achievement-types";

interface SupabaseListResult<T> {
  success: boolean;
  data?: T[];
  error?: string;
}

const ACHIEVEMENT_TABLE = "achievements";
const USER_ACHIEVEMENT_TABLE = "user_achievements";

const toAchievement = (row: Record<string, unknown>): AchievementDefinition => ({
  id: String(row.id),
  code: String(row.code),
  title: String(row.title ?? ""),
  description: row.description ? String(row.description) : null,
  isActive: Boolean(row.is_active),
  imageUrl: row.image_url ? String(row.image_url) : null,
  rule:
    typeof row.rule === "object" && row.rule !== null
      ? (row.rule as AchievementRule)
      : null,
});

const toUserAchievement = (row: Record<string, unknown>): UserAchievement => ({
  id: String(row.id),
  userId: String(row.user_id),
  achievementId: String(row.achievement_id ?? row.id),
  achievedAt: String(row.awarded_at ?? new Date().toISOString()),
  sourceEventId: row.source_event_id ? String(row.source_event_id) : null,
  context:
    typeof row.context === "object" && row.context !== null
      ? (row.context as Record<string, unknown>)
      : null,
});

/**
 * 활성화된 업적 카탈로그를 조회합니다.
 */
export const fetchAchievementCatalog = async (): Promise<
  SupabaseListResult<AchievementDefinition>
> => {
  const client = await createServerSupabaseClient();
  const { data, error } = await client
    .from(ACHIEVEMENT_TABLE)
    .select()
    .eq("is_active", true)
    .order("created_at", { ascending: true });

  if (error) {
    return { success: false, error: error.message };
  }

  return {
    success: true,
    data: (data ?? []).map((row) => toAchievement(row as Record<string, unknown>)),
  };
};

/**
 * 특정 사용자의 업적 기록을 조회합니다 (읽기 전용).
 */
export const fetchUserAchievements = async (
  userId: string
): Promise<SupabaseListResult<UserAchievement>> => {
  const client = await createServerSupabaseClient();
  const { data, error } = await client
    .from(USER_ACHIEVEMENT_TABLE)
    .select()
    .eq("user_id", userId)
    .order("awarded_at", { ascending: false });

  if (error) {
    return { success: false, error: error.message };
  }

  return {
    success: true,
    data: (data ?? []).map((row) =>
      toUserAchievement(row as Record<string, unknown>)
    ),
  };
};

export const getProfileAchievements = async (
  userId: string
): Promise<ProfileAchievement[]> => {
  const [catalogResult, userResult] = await Promise.all([
    fetchAchievementCatalog(),
    fetchUserAchievements(userId),
  ]);

  if (!catalogResult.success || !catalogResult.data) {
    return [];
  }

  const unlockedMap = new Map<string, UserAchievement>();
  if (userResult.success && userResult.data) {
    userResult.data.forEach((achievement) => {
      unlockedMap.set(achievement.achievementId, achievement);
    });
  }

  return catalogResult.data.map((achievement) => {
    const unlocked = unlockedMap.get(achievement.id);
    return {
      id: achievement.id,
      title: achievement.title,
      description: achievement.description,
      imageUrl: achievement.imageUrl,
      isUnlocked: Boolean(unlocked),
      achievedAt: unlocked?.achievedAt ?? null,
    };
  });
};

interface TriggerAchievementActionServerParams {
  userId: string;
  achievementId: string;
  event: string;
  payload?: Record<string, unknown>;
}

export const triggerAchievementActionServer = async ({
  userId,
  achievementId,
  event,
  payload,
}: TriggerAchievementActionServerParams): Promise<ActionAwardSummary[]> => {
  const client = await createServerSupabaseClient();
  const { data, error } = await client.rpc("grant_achievement_from_action", {
    p_user_id: userId,
    p_achievement_id: achievementId,
    p_event: event,
    p_payload: payload ?? {},
  });

  if (error) {
    console.error("Failed to trigger achievement action:", error.message);
    return [];
  }

  return (data ?? []).map((row: Record<string, unknown>) => ({
    achievementId: String(
      (row.achievement_id ?? "") as string
    ),
    achievementTitle: row.achievement_title
      ? String(row.achievement_title)
      : undefined,
    achievementImageUrl: row.achievement_image_url
      ? String(row.achievement_image_url)
      : undefined,
  }));
};

export const fetchAchievementsByEvent = async (
  event: string
): Promise<SupabaseListResult<AchievementDefinition>> => {
  const client = await createServerSupabaseClient();
  const { data, error } = await client
    .from(ACHIEVEMENT_TABLE)
    .select()
    .eq("is_active", true)
    .filter("rule->>event", "eq", event);

  if (error) {
    return { success: false, error: error.message };
  }

  return {
    success: true,
    data: (data ?? []).map((row) => toAchievement(row as Record<string, unknown>)),
  };
};

export type {
  AchievementDefinition,
  ProfileAchievement,
  UserAchievement,
} from "@/services/achievement-types";
