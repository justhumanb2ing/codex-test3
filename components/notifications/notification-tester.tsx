"use client";

import { FormEvent, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useSession, useUser } from "@clerk/nextjs";

type TargetType = "all" | "user";

export const NotificationTester = () => {
  const [mounted, setMounted] = useState(false);
  const [title, setTitle] = useState("테스트 알림");
  const [body, setBody] = useState("이것은 테스트 메시지입니다.");
  const [actionUrl, setActionUrl] = useState("/");
  const [target, setTarget] = useState<TargetType>("all");
  const [targetUserId, setTargetUserId] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useUser();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus(null);

    if (target === "user" && !targetUserId.trim()) {
      setStatus("특정 사용자에게 보낼 때는 user_id를 입력해주세요.");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch("/api/notifications/test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          body,
          actionUrl,
          userId:
            target === "user" ? targetUserId.trim() || undefined : user?.id,
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error ?? "알림 전송에 실패했습니다.");
      }

      setStatus("알림이 성공적으로 전송되었습니다.");
    } catch (error) {
      setStatus(
        error instanceof Error ? error.message : "알림 전송에 실패했습니다."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <section className="rounded-3xl border border-border/70 bg-card/50 p-6">
      <h2 className="text-xl font-semibold text-foreground">알림 테스트</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        아래 양식을 제출하면 Supabase → Realtime → PWA 알림 흐름을 바로 확인할
        수 있습니다.
      </p>
      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <div className="space-y-1">
          <label htmlFor="notification-title" className="text-sm font-medium">
            알림 제목
          </label>
          <Input
            id="notification-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="notification-body" className="text-sm font-medium">
            내용
          </label>
          <Textarea
            id="notification-body"
            value={body}
            onChange={(event) => setBody(event.target.value)}
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="notification-action" className="text-sm font-medium">
            이동 경로(URL)
          </label>
          <Input
            id="notification-action"
            value={actionUrl}
            onChange={(event) => setActionUrl(event.target.value)}
          />
        </div>
        <div className="space-y-4 rounded-2xl border border-border/60 p-4">
          <p className="text-sm font-medium">대상 선택</p>
          <div className="flex flex-col gap-3 md:flex-row">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="notification-target"
                value="all"
                checked={target === "all"}
                onChange={() => setTarget("all")}
              />
              전체 사용자
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="notification-target"
                value="user"
                checked={target === "user"}
                onChange={() => setTarget("user")}
              />
              특정 사용자
            </label>
          </div>
          {target === "user" ? (
            <Input
              placeholder="수신자 user_id"
              value={targetUserId}
              onChange={(event) => setTargetUserId(event.target.value)}
            />
          ) : null}
        </div>
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "전송 중..." : "테스트 알림 보내기"}
        </Button>
        {status ? (
          <p className="text-sm text-muted-foreground">{status}</p>
        ) : null}
      </form>
    </section>
  );
};
