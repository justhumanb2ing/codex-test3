import Link from "next/link"

import { signOutAction } from "@/app/(auth)/actions"
import { AuthCard } from "@/components/auth/auth-card"
import { Button } from "@/components/ui/button"
import { getSearchParam } from "@/lib/search-params"

interface PageProps {
  searchParams?:
    | Record<string, string | string[] | undefined>
    | Promise<Record<string, string | string[] | undefined>>
}

export default async function LogoutPage({ searchParams }: PageProps) {
  const resolvedParams = (await searchParams) ?? undefined
  const errorMessage = getSearchParam(resolvedParams, "error")

  return (
    <AuthCard
      title="로그아웃"
      description="현재 계정에서 로그아웃하고 다른 계정으로 로그인할 수 있습니다."
      footer={
        <>
          로그인이 필요하신가요?{" "}
          <Link className="font-semibold text-primary" href="/login">
            로그인 페이지로 이동
          </Link>
        </>
      }
    >
      {errorMessage ? (
        <p className="mb-6 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {errorMessage}
        </p>
      ) : null}
      <form action={signOutAction} className="space-y-6">
        <input type="hidden" name="redirectTo" value="/" />
        <input type="hidden" name="errorRedirect" value="/logout" />
        <Button type="submit" variant="secondary" className="w-full">
          지금 로그아웃하기
        </Button>
      </form>
    </AuthCard>
  )
}
