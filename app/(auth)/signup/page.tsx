import Link from "next/link"
import { redirect } from "next/navigation"

import { AuthCard } from "@/components/auth/auth-card"
import { KakaoLoginButton } from "@/components/auth/kakao-login-button"
import { Button } from "@/components/ui/button"
import { getSearchParam } from "@/lib/search-params"
import { signUpWithEmail } from "@/services/auth-service"

const signUpAction = async (formData: FormData) => {
  "use server"

  const email = formData.get("email")
  const password = formData.get("password")
  const confirmPassword = formData.get("confirmPassword")

  if (!email || !password || !confirmPassword) {
    redirect(`/signup?error=${encodeURIComponent("모든 필드를 입력해주세요.")}`)
  }

  if (String(password).length < 6) {
    redirect(`/signup?error=${encodeURIComponent("비밀번호는 6자 이상이어야 합니다.")}`)
  }

  if (password !== confirmPassword) {
    redirect(`/signup?error=${encodeURIComponent("비밀번호가 일치하지 않습니다.")}`)
  }

  const result = await signUpWithEmail({
    email: String(email),
    password: String(password),
  })

  if (!result.success) {
    redirect(
      `/signup?error=${encodeURIComponent(
        result.error ?? "회원가입에 실패했습니다.",
      )}`,
    )
  }

  redirect(
    `/login?success=${encodeURIComponent(
      "가입을 완료했습니다. 이메일로 전송된 확인 링크를 열어 인증을 마친 뒤 로그인해주세요.",
    )}`,
  )
}

interface PageProps {
  searchParams?:
    | Record<string, string | string[] | undefined>
    | Promise<Record<string, string | string[] | undefined>>
}

const fieldStyles =
  "w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"

export default async function SignupPage({ searchParams }: PageProps) {
  const resolvedParams = (await searchParams) ?? undefined
  const errorMessage = getSearchParam(resolvedParams, "error")

  return (
    <AuthCard
      title="회원가입"
      description="이메일 인증 링크를 확인해야 가입이 완료됩니다."
      footer={
        <>
          이미 가입하셨나요?{" "}
          <Link className="font-semibold text-primary" href="/login">
            로그인
          </Link>
        </>
      }
    >
      {errorMessage ? (
        <p className="mb-6 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {errorMessage}
        </p>
      ) : null}
      <form action={signUpAction} className="space-y-5">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground" htmlFor="email">
            이메일
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className={fieldStyles}
            placeholder="you@example.com"
            autoComplete="email"
          />
        </div>
        <div className="space-y-2">
          <label
            className="text-sm font-medium text-foreground"
            htmlFor="password"
          >
            비밀번호
          </label>
          <input
            id="password"
            name="password"
            type="password"
            minLength={6}
            required
            className={fieldStyles}
            placeholder="최소 6자 이상"
            autoComplete="new-password"
          />
        </div>
        <div className="space-y-2">
          <label
            className="text-sm font-medium text-foreground"
            htmlFor="confirmPassword"
          >
            비밀번호 확인
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            minLength={6}
            required
            className={fieldStyles}
            placeholder="비밀번호를 다시 입력하세요"
            autoComplete="new-password"
          />
        </div>
        <Button type="submit" className="w-full">
          회원가입
        </Button>
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-100">
          가입 직후 Supabase에서 발송한 확인 이메일의 링크를 열어야 로그인할 수
          있습니다.
        </p>
      </form>
      <div className="mt-8 space-y-4">
        <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          <span className="h-px flex-1 bg-border" aria-hidden />
          또는
          <span className="h-px flex-1 bg-border" aria-hidden />
        </div>
        <KakaoLoginButton nextPath="/" />
        <p className="text-center text-xs text-muted-foreground">
          Kakao 인증을 완료하면 이메일 확인 없이 바로 로그인 상태가 유지됩니다.
        </p>
      </div>
    </AuthCard>
  )
}
