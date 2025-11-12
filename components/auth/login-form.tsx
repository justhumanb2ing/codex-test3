"use client"

import { useActionState, useState } from "react"

import {
  loginAction,
  type LoginActionState,
} from "@/app/(auth)/actions"
import { Button } from "@/components/ui/button"

interface LoginFormProps {
  initialErrorMessage?: string
}

const buildInitialState = (
  error?: string,
): LoginActionState => ({
  error,
})

export const LoginForm = ({
  initialErrorMessage,
}: LoginFormProps) => {
  const [state, formAction, isPending] = useActionState(
    loginAction,
    buildInitialState(initialErrorMessage),
  )
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  return (
    <form action={formAction} className="space-y-5">
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground" htmlFor="email">
          이메일
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          placeholder="••••••••"
          autoComplete="current-password"
        />
      </div>
      {state?.error ? (
        <p
          role="alert"
          className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {state.error}
        </p>
      ) : null}
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "확인 중..." : "로그인"}
      </Button>
    </form>
  )
}
