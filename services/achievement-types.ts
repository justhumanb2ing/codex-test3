export type RuleType = "count" | "streak" | "event" | "composite";
export type RuleLogic = "AND" | "OR";

export interface RuleContext {
  userId: string;
  event: string;
  payload: Record<string, unknown>;
}

export interface BaseRule {
  event: string;
  type: RuleType;
}

export interface ComparisonRule extends BaseRule {
  metric: string;
  operator: ">=" | ">" | "==" | "<=" | "<";
  value: number;
}

export interface EventRule extends BaseRule {
  metric?: string;
}

export interface CompositeRule extends BaseRule {
  logic: RuleLogic;
  rules: AchievementRule[];
}

export type AchievementRule = ComparisonRule | EventRule | CompositeRule;

export interface AchievementDefinition {
  id: string;
  code: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  rule: AchievementRule | null;
  isActive: boolean;
}

export interface UserAchievement {
  id: string;
  userId: string;
  achievementId: string;
  achievedAt: string;
  sourceEventId: string | null;
  context: Record<string, unknown> | null;
}

export interface ActionAwardSummary {
  achievementId: string;
  achievementTitle?: string;
  achievementImageUrl?: string | null;
}

export interface TriggerAchievementActionParams {
  userId: string;
  achievementId: string;
  event: string;
  payload?: Record<string, unknown>;
  getToken: () => Promise<string | null>;
}

export interface TriggerAchievementActionResult {
  success: boolean;
  awards?: ActionAwardSummary[];
  error?: string;
}

export type AchievementRealtimePayload = {
  kind: "achievement";
  achievement: UserAchievement;
};

export interface AchievementRealtimeSubscribeOptions {
  userId: string;
  getToken: () => Promise<string | null>;
  onAwarded: (payload: AchievementRealtimePayload) => void;
}

export interface AchievementRealtimeSubscription {
  unsubscribe: () => void;
}

export interface ProfileAchievement {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  isUnlocked: boolean;
  achievedAt: string | null;
}
