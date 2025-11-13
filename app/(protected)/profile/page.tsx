import Link from "next/link"
import { redirect } from "next/navigation"
import { Sparkles } from "lucide-react"

import { ProfileEditModal } from "@/components/profile/profile-edit-modal"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { getCurrentUser } from "@/services/auth-service"
import { listReadingEntries } from "@/services/reading-log-service"

const buildDisplayName = (
  metadata: Record<string, unknown>,
  fallback?: string,
) => {
  const nameFields = ["custom_full_name", "full_name", "name", "nickname"]
  for (const field of nameFields) {
    const value = metadata?.[field]
    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim()
    }
  }
  return fallback ?? "이름 없는 사용자"
}

const buildAvatarUrl = (metadata: Record<string, unknown>) => {
  const candidates = ["custom_avatar_url", "avatar_url", "picture"]
  for (const field of candidates) {
    const value = metadata?.[field]
    if (typeof value === "string" && value.trim().length > 0) {
      return value
    }
  }
  return undefined
}

const buildInitials = (name: string) => {
  const [first = "", second = ""] = name.split(" ")
  const initials = `${first[0] ?? ""}${second[0] ?? ""}`.trim()
  if (initials) {
    return initials.toUpperCase()
  }
  return name.slice(0, 2).toUpperCase() || "US"
}

export default async function ProfileSettingsPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
    return null
  }

  const readingsResult = await listReadingEntries(user.id)
  const historyCount =
    readingsResult.success && readingsResult.data
      ? readingsResult.data.length
      : 0
  const hasEnoughHistory = historyCount > 5

  const metadata = (user.user_metadata ?? {}) as Record<string, unknown>
  const displayName = buildDisplayName(metadata, user.email ?? undefined)
  const avatarUrl = buildAvatarUrl(metadata)
  const initials = buildInitials(displayName)

  const secondarySections = ["업적 및 배지"]

  return (
    <main className="space-y-10">
      <section className="space-y-6 rounded-xl border border-border/60 bg-card/40 p-6 shadow-sm">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarUrl}
                alt={`${displayName} 프로필 이미지`}
                className="size-20 rounded-full border border-border/50 object-cover"
              />
            ) : (
              <div className="flex size-20 items-center justify-center rounded-full border border-dashed border-border/70 bg-muted/50 text-lg font-semibold text-muted-foreground">
                {initials}
              </div>
            )}
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                내 프로필
              </p>
              <h1 className="text-2xl font-semibold text-foreground">
                {displayName}
              </h1>
              <p className="text-sm text-muted-foreground">
                {user.email ?? "이메일 정보가 없습니다."}
              </p>
            </div>
          </div>
          <ProfileEditModal
            defaultName={displayName}
            defaultAvatarUrl={avatarUrl}
          />
        </div>
      </section>
      <section className="rounded-xl border border-dashed border-border/50 bg-card/20 p-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Timeline
            </p>
            <h2 className="text-xl font-semibold text-foreground">
              독서 히스토리 시각화
            </h2>
          </div>
        </div>
        {historyCount === 0 ? (
          <Empty
            data-testid="history-empty"
            className="mt-6 rounded-2xl border border-dashed border-border/60 bg-muted/20"
          >
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Sparkles className="size-5 text-primary" />
              </EmptyMedia>
              <EmptyTitle>아직 기록이 없어요</EmptyTitle>
              <EmptyDescription>
                첫 독서 히스토리를 작성하면 시각화 리포트를 만들어드릴게요.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button asChild className="w-full md:w-64">
                <Link href="/reading/new">독서 히스토리 작성하기</Link>
              </Button>
            </EmptyContent>
          </Empty>
        ) : (
          <div className="mt-6 space-y-2 text-sm text-muted-foreground">
            <p>
              최근 {historyCount}개의 독서 기록을 기반으로 트렌드를 분석할 수
              있어요. 시각화 기능은 곧 제공될 예정입니다.
            </p>
          </div>
        )}
      </section>
      {secondarySections.map((title) => (
        <section
          key={title}
          className="rounded-xl border border-dashed border-border/50 bg-card/20 p-6"
        >
          <h2 className="text-xl font-semibold text-foreground">{title}</h2>
        </section>
      ))}
      <section className="rounded-xl border border-dashed border-border/50 bg-card/20 p-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Insights
            </p>
            <h2 className="text-xl font-semibold text-foreground">
              사용자 분석
            </h2>
          </div>
          {hasEnoughHistory ? (
            <Button variant="secondary" className="w-full md:w-auto">
              사용자 분석
            </Button>
          ) : null}
        </div>
        {!hasEnoughHistory ? (
          <Empty
            data-testid="analysis-empty"
            className="mt-6 rounded-2xl border border-dashed border-border/60 bg-muted/20"
          >
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Sparkles className="size-5 text-primary" />
              </EmptyMedia>
              <EmptyTitle>조금만 더 기록해볼까요?</EmptyTitle>
              <EmptyDescription>
                히스토리를 5개 적으면 사용자 분석을 할 수 있어요
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button disabled className="w-full md:w-64">
                사용자 분석
              </Button>
            </EmptyContent>
          </Empty>
        ) : (
          <div className="mt-6 space-y-4 rounded-2xl border border-border/60 bg-card/40 p-6">
            <p className="text-sm text-muted-foreground">
              사용자의 독서 패턴과 감상 키워드를 바탕으로 맞춤 인사이트를
              준비했습니다.
            </p>
            <Button className="w-full md:w-64">사용자 분석 열기</Button>
          </div>
        )}
      </section>
    </main>
  )
}
