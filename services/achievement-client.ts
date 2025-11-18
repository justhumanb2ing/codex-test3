import { createBrowserSupabaseClient } from "@/lib/supabase-browser";
import type {
  AchievementDefinition,
  AchievementRealtimePayload,
  AchievementRealtimeSubscribeOptions,
  ActionAwardSummary,
  TriggerAchievementActionParams,
  TriggerAchievementActionResult,
  UserAchievement,
  AchievementRule,
} from "@/services/achievement-types";

const USER_ACHIEVEMENT_TABLE = "user_achievements";

const toUserAchievement = (row: Record<string, unknown>): UserAchievement => ({
  id: String(row.id),
  userId: String(row.user_id),
  achievementId: String(row.achievement_id),
  achievedAt: String(row.achieved_at),
  sourceEventId: row.source_event_id ? String(row.source_event_id) : null,
  context:
    typeof row.context === "object" && row.context !== null
      ? (row.context as Record<string, unknown>)
      : null,
});

export const triggerAchievementAction = async ({
  userId,
  achievementId,
  event,
  payload,
  getToken,
}: TriggerAchievementActionParams): Promise<TriggerAchievementActionResult> => {
  const client = createBrowserSupabaseClient(getToken);
  const { data, error } = await client.rpc("grant_achievement_from_action", {
    p_user_id: userId,
    p_achievement_id: achievementId,
    p_event: event,
    p_payload: payload ?? {},
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return {
    success: true,
    awards: (data ?? []).map((row: Record<string, unknown>) => ({
      achievementId: String(row.achievement_id ?? ""),
      achievementTitle: row.achievement_title
        ? String(row.achievement_title)
        : undefined,
      achievementImageUrl: row.achievement_image_url
        ? String(row.achievement_image_url)
        : undefined,
    })),
  };
};

export const fetchAllBadges = async (
  getToken: () => Promise<string | null>
): Promise<AchievementDefinition[]> => {
  const client = createBrowserSupabaseClient(getToken);
  const { data } = await client.from("achievements").select();
  return (
    data?.map((row) => ({
      id: String(row.id),
      code: String(row.code),
      title: String(row.title ?? ""),
      description: row.description ? String(row.description) : null,
      imageUrl: row.image_url ? String(row.image_url) : null,
      rule:
        typeof row.rule === "object" && row.rule !== null
          ? (row.rule as AchievementRule)
          : null,
      isActive: Boolean(row.is_active),
    })) ?? []
  );
};

export const subscribeToAchievementAwards = ({
  userId,
  getToken,
  onAwarded,
}: AchievementRealtimeSubscribeOptions) => {
  const client = createBrowserSupabaseClient(getToken);
  const channel = client
    .channel(`achievements-user-${userId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: USER_ACHIEVEMENT_TABLE,
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        onAwarded({
          kind: "achievement",
          achievement: toUserAchievement(payload.new as Record<string, unknown>),
        });
      }
    )
    .subscribe();

  return {
    unsubscribe: () => {
      client.removeChannel(channel);
    },
  };
};

export type {
  ActionAwardSummary,
  AchievementRealtimePayload,
  AchievementRealtimeSubscribeOptions,
  TriggerAchievementActionParams,
  TriggerAchievementActionResult,
} from "@/services/achievement-types";
