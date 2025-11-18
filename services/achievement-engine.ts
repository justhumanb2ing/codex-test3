import {
  fetchAchievementsByEvent,
  fetchUserAchievements,
  triggerAchievementActionServer,
} from "@/services/achievement-service";
import { getReadingEntryCount } from "@/services/reading-log-service";
import type {
  AchievementDefinition,
  AchievementRule,
  RuleContext,
} from "@/services/achievement-types";

type MetricHandler = (
  context: RuleContext
) => Promise<number | boolean>;

const metricHandlers: Record<string, MetricHandler> = {
  reading_entry_count: async ({ userId }) => getReadingEntryCount(userId),
};

const getMetricValue = async (
  metric: string | undefined,
  context: RuleContext
): Promise<number | boolean> => {
  if (!metric) return 0;
  const handler = metricHandlers[metric];
  if (!handler) return 0;
  return handler(context);
};

const compare = (
  value: number | boolean,
  operator: string,
  target: number
): boolean => {
  const numeric = Number(value);
  switch (operator) {
    case ">=":
      return numeric >= target;
    case ">":
      return numeric > target;
    case "==":
      return numeric === target;
    case "<=":
      return numeric <= target;
    case "<":
      return numeric < target;
    default:
      return false;
  }
};

const evaluateRule = async (
  rule: AchievementRule,
  context: RuleContext
): Promise<boolean> => {
  if (rule.event && rule.event !== context.event) {
    return false;
  }

  if (rule.type === "composite") {
    const evaluations = await Promise.all(
      rule.rules.map((subRule) => evaluateRule(subRule, context))
    );
    return rule.logic === "AND"
      ? evaluations.every(Boolean)
      : evaluations.some(Boolean);
  }

  if ("metric" in rule) {
    const metricValue = await getMetricValue(rule.metric, context);
    return compare(metricValue, rule.operator, rule.value);
  }

  return true;
};

export const processAchievements = async (
  context: RuleContext
): Promise<void> => {
  const [achievementResult, userResult] = await Promise.all([
    fetchAchievementsByEvent(context.event),
    fetchUserAchievements(context.userId),
  ]);

  if (!achievementResult.success || !achievementResult.data) {
    return;
  }

  const unlockedIds = new Set(
    (userResult.data ?? []).map((achievement) => achievement.achievementId)
  );

  await Promise.all(
    achievementResult.data.map(async (achievement: AchievementDefinition) => {
      if (!achievement.rule || unlockedIds.has(achievement.id)) {
        return;
      }

      const satisfied = await evaluateRule(achievement.rule, context);
      if (!satisfied) {
        return;
      }

      await triggerAchievementActionServer({
        userId: context.userId,
        achievementId: achievement.id,
        event: context.event,
        payload: context.payload,
      });
    })
  );
};
