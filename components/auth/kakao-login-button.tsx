"use client"

import { useActionState } from "react"

import {
  kakaoLoginAction,
  type SocialLoginActionState,
} from "@/app/(auth)/actions"
import { Button } from "@/components/ui/button"

const initialState: SocialLoginActionState = { error: undefined }

interface KakaoLoginButtonProps {
  nextPath?: string
}

export const KakaoLoginButton = ({ nextPath = "/" }: KakaoLoginButtonProps) => {
  const [state, formAction, isPending] = useActionState(
    kakaoLoginAction,
    initialState,
  )

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="next" value={nextPath} />
      <Button
        type="submit"
        variant="outline"
        className="w-full border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-50"
        disabled={isPending}
      >
        {isPending ? "카카오 연결 중..." : "카카오 계정으로 계속"}
      </Button>
      {state?.error ? (
        <p
          role="alert"
          className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {state.error}
        </p>
      ) : null}
    </form>
  )
}
