import { redirect } from "next/navigation"

import { getCurrentUser } from "@/services/auth-service"
import { ProfileEditModal } from "@/components/profile/profile-edit-modal"

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

  const metadata = (user.user_metadata ?? {}) as Record<string, unknown>
  const displayName = buildDisplayName(metadata, user.email ?? undefined)
  const avatarUrl = buildAvatarUrl(metadata)
  const initials = buildInitials(displayName)

  const secondarySections = [
    "독서 히스토리 시각화",
    "업적 및 배지",
    "사용자 분석",
  ]

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
      {secondarySections.map((title) => (
        <section
          key={title}
          className="rounded-xl border border-dashed border-border/50 bg-card/20 p-6"
        >
          <h2 className="text-xl font-semibold text-foreground">{title}</h2>
        </section>
      ))}
    </main>
  )
}
