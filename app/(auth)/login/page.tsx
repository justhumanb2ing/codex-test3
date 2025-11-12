import Link from "next/link"

import { AuthCard } from "@/components/auth/auth-card"
import { KakaoLoginButton } from "@/components/auth/kakao-login-button"
import { LoginForm } from "@/components/auth/login-form"
import { getSearchParam } from "@/lib/search-params"

interface PageProps {
  searchParams?:
    | Record<string, string | string[] | undefined>
    | Promise<Record<string, string | string[] | undefined>>
}

export default async function LoginPage({ searchParams }: PageProps) {
  const resolvedParams = (await searchParams) ?? undefined
  const errorMessage = getSearchParam(resolvedParams, "error")
  const successMessage = getSearchParam(resolvedParams, "success")

  return (
    <AuthCard
      title="로그인"
      description="Supabase 계정으로 서비스를 이용해 보세요."
      footer={
        <>
          아직 계정이 없으신가요?{" "}
          <Link className="font-semibold text-primary" href="/signup">
            회원가입
          </Link>
        </>
      }
    >
      {successMessage ? (
        <p className="mb-6 rounded-lg border border-emerald-600/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-300">
          {successMessage}
        </p>
      ) : null}
      <LoginForm initialErrorMessage={errorMessage} />
      <div className="mt-8 space-y-4">
        <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          <span className="h-px flex-1 bg-border" aria-hidden />
          또는
          <span className="h-px flex-1 bg-border" aria-hidden />
        </div>
        <KakaoLoginButton nextPath="/" />
      </div>
    </AuthCard>
  )
}
