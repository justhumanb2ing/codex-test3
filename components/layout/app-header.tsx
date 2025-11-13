import Link from "next/link"

import { ProfileMenu } from "@/components/auth/profile-menu"
import { Button } from "@/components/ui/button"
import { getCurrentUser } from "@/services/auth-service"

const buildProfile = (user: Awaited<ReturnType<typeof getCurrentUser>>) => {
  if (!user) return null
  const metadata = user.user_metadata ?? {}
  const name =
    (metadata?.custom_full_name as string | undefined) ??
    (metadata?.full_name as string | undefined) ??
    (metadata?.name as string | undefined)
  const avatarUrl =
    (metadata?.custom_avatar_url as string | undefined) ??
    (metadata?.avatar_url as string | undefined) ??
    (metadata?.picture as string | undefined)

  return {
    email: user.email ?? "",
    name: name ?? undefined,
    avatarUrl,
  }
}

export const AppHeader = async () => {
  const user = await getCurrentUser()
  const profile = buildProfile(user)

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-sm font-semibold tracking-tight">
          Codex Auth
        </Link>
        {profile ? (
          <ProfileMenu profile={profile} />
        ) : (
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="sm">
              <Link href="/login">로그인</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/signup">회원가입</Link>
            </Button>
          </div>
        )}
      </div>
    </header>
  )
}
