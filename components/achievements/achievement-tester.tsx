"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toastManager } from "@/components/ui/toast";
import {
  subscribeToAchievementAwards,
  triggerAchievementAction,
  type ActionAwardSummary,
  type AchievementRealtimePayload,
} from "@/services/achievement-client";
import type { AchievementDefinition } from "@/services/achievement-types";
import { useBadgeCatalog } from "@/hooks/use-badge-catalog";

interface FeedEntry {
  id: string;
  label: string;
  kind: "achievement" | "badge";
  occurredAt: string;
}

const DEFAULT_ACHIEVEMENT_IMAGE = "/next.svg";

const normalizeTitle = (value?: string | null) => {
  if (!value) return null;
  const trimmed = value.trim();
  if (
    trimmed.length === 0 ||
    trimmed.toLowerCase() === "undefined" ||
    trimmed.toLowerCase() === "null"
  ) {
    return null;
  }
  return trimmed;
};

export const AchievementTester = () => {
  const { userId, isLoaded, getToken } = useAuth();
  const router = useRouter();
  const [feed, setFeed] = useState<FeedEntry[]>([]);
  const [isTriggering, setIsTriggering] = useState<string | null>(null);
  const supabaseTokenFetcher = useCallback(() => getToken(), [getToken]);
  const {
    resolveBadge,
    badges: catalogBadges,
    isReady: isCatalogReady,
  } = useBadgeCatalog(supabaseTokenFetcher);

  const isUserReady = isLoaded && Boolean(userId);

  const showAchievementToast = useCallback(
    (title: string | null | undefined, imageUrl?: string | null) => {
      const normalized = normalizeTitle(title);
      const fallbackTitle = normalized ?? "새 배지를 획득했습니다";
      toastManager.add({
        type: "success",
        timeout: 5000,
        title: `${fallbackTitle} 달성!`,
        description: "프로필에서 다른 업적도 확인해보세요.",
        data: {
          imageUrl: imageUrl ?? DEFAULT_ACHIEVEMENT_IMAGE,
        },
        actionProps: {
          children: "프로필로 이동",
          onClick: () => {
            if (userId) {
              router.push(`/profile/${userId}`);
            }
          },
        },
      });
    },
    [router, userId]
  );

  const addFeedEntry = useCallback((entry: FeedEntry) => {
    setFeed((prev) => [entry, ...prev].slice(0, 5));
  }, []);

  const findAchievementMeta = useCallback(
    (identifier?: string | null) => {
      if (!identifier) return null;
      const meta = resolveBadge(identifier);
      if (!meta) {
        return null;
      }
      return {
        id: meta.id,
        code: meta.code,
        title: meta.title,
        imageUrl: meta.imageUrl ?? null,
        description: meta.description ?? null,
      };
    },
    [resolveBadge]
  );

  useEffect(() => {
    if (!userId) {
      return;
    }

    const subscription = subscribeToAchievementAwards({
      userId,
      getToken: supabaseTokenFetcher,
      onAwarded: (payload: AchievementRealtimePayload) => {
        const achievementId = payload.achievement.achievementId;
        const meta = findAchievementMeta(achievementId);
        const label =
          normalizeTitle(meta?.title) ??
          normalizeTitle(achievementId) ??
          "새 배지";

        addFeedEntry({
          id: payload.achievement.id,
          label,
          kind: "achievement",
          occurredAt: payload.achievement.achievedAt,
        });

        showAchievementToast(
          label,
          meta?.imageUrl ?? DEFAULT_ACHIEVEMENT_IMAGE
        );
      },
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [
    addFeedEntry,
    findAchievementMeta,
    showAchievementToast,
    supabaseTokenFetcher,
    userId,
  ]);

  const handleTrigger = async (achievement: AchievementDefinition) => {
    if (!userId) {
      toastManager.add({
        title: "로그인이 필요합니다",
        description: "업적 테스트를 실행하려면 로그인이 필요합니다.",
        type: "warning",
        timeout: 4000,
      });
      return;
    }

    const ruleEvent = (achievement.rule as { event?: string } | null)?.event;
    if (!ruleEvent) {
      toastManager.add({
        title: "테스트 불가",
        description:
          "이 업적은 이벤트 기반이 아니어서 수동 테스트가 불가능합니다.",
        type: "error",
      });
      return;
    }

    setIsTriggering(achievement.id);
    try {
      const result = await triggerAchievementAction({
        userId,
        achievementId: achievement.id,
        event: ruleEvent,
        payload: { testing: true },
        getToken: supabaseTokenFetcher,
      });

      if (!result.success) {
        toastManager.add({
          title: "실패",
          description: result.error ?? "업적 처리가 실패했습니다.",
          type: "error",
        });
        return;
      }

      (result.awards ?? []).forEach((award: ActionAwardSummary) => {
        const meta = findAchievementMeta(award.achievementId);

        const label =
          normalizeTitle(award.achievementTitle) ??
          normalizeTitle(meta?.title) ??
          normalizeTitle(award.achievementId) ??
          normalizeTitle(achievement.title) ??
          "새 배지";

        addFeedEntry({
          id: award.achievementId,
          label,
          kind: "achievement",
          occurredAt: new Date().toISOString(),
        });

        showAchievementToast(
          label,
          award.achievementImageUrl ?? meta?.imageUrl
        );

      });
    } finally {
      setIsTriggering(null);
    }
  };

  const latestFeed = useMemo(() => feed.slice(0, 3), [feed]);

  return (
    <Card className="border-dashed border-primary/30 bg-card/80">
      <CardHeader>
        <CardTitle>업적 & 배지 실시간 테스트</CardTitle>
        <CardDescription>
          Supabase Realtime 기반의 업적/배지 시스템 동작을 검증합니다. 사용자가
          특정 행동을 전송하면 RPC → DB Insert → Realtime 순으로 이벤트가
          전파되고, 토스트는 하단 중앙에 표시됩니다.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <section className="space-y-2 rounded-xl border border-border/60 bg-muted/40 p-4 text-sm">
          <p className="font-medium text-foreground">상태</p>
          <p className="text-muted-foreground">
            {isUserReady
              ? "사용자 채널에 연결되었습니다. 버튼을 눌러 업적을 시뮬레이션하세요."
              : "Clerk 인증 정보가 없어 모니터링만 가능합니다."}
          </p>
        </section>
        <section className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            업적 카탈로그
          </h3>
          {isCatalogReady && catalogBadges.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              업적 데이터가 없습니다. Supabase에 업적을 추가해주세요.
            </p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-3">
              {catalogBadges.slice(0, 6).map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-border/50 bg-background/60 p-4 space-y-3"
                >
                  <div className="relative h-24 w-full overflow-hidden rounded-xl border border-border/50 bg-muted">
                    <Image
                      src={item.imageUrl ?? DEFAULT_ACHIEVEMENT_IMAGE}
                      alt={`${item.title} 이미지`}
                      fill
                      sizes="180px"
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-xs uppercase text-muted-foreground">
                      {item.code}
                    </p>
                    <p className="text-base font-semibold">{item.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.description ?? "설명이 없습니다."}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              행동 시뮬레이터
            </h3>
            <Badge variant="secondary" className="rounded-full">
              실시간
            </Badge>
          </div>
          <div className="grid gap-3">
            {(catalogBadges ?? []).map((achievement) => (
              <div
                key={achievement.id}
                className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-background/70 p-4 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="font-semibold">{achievement.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {achievement.description ??
                      "Supabase에 저장된 실제 업적입니다."}
                  </p>
                </div>
                <Button
                  disabled={!isUserReady || isTriggering === achievement.id}
                  onClick={() => handleTrigger(achievement)}
                  variant="secondary"
                >
                  {isTriggering === achievement.id ? "처리 중..." : "액션 전송"}
                </Button>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            최근 이벤트
          </h3>
          {latestFeed.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              아직 수신된 업적/배지 이벤트가 없습니다.
            </p>
          ) : (
            <ul className="space-y-2">
              {latestFeed.map((entry) => (
                <li
                  key={entry.id}
                  className="flex items-center justify-between rounded-2xl border border-border/60 bg-background/80 p-3"
                >
                  <div>
                    <p className="font-medium text-foreground">{entry.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {entry.kind === "achievement" ? "업적" : "배지"} ·{" "}
                      {new Date(entry.occurredAt).toLocaleString("ko-KR")}
                    </p>
                  </div>
                  <Badge variant="outline" className="rounded-full uppercase">
                    {entry.kind}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </section>
      </CardContent>
    </Card>
  );
};
