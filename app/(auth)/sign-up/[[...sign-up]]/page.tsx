import Link from "next/link"
import { SignUp } from "@clerk/nextjs"

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-16">
      <div className="w-full max-w-md space-y-6 rounded-2xl border border-border/70 bg-card/95 p-6 shadow-lg backdrop-blur">
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">회원가입</h1>
          <p className="text-sm text-muted-foreground">
            Clerk 가입을 완료하고 개인화된 독서 경험을 시작하세요.
          </p>
        </div>
        <SignUp path="/sign-up" routing="path" signInUrl="/sign-in" />
        <p className="text-center text-sm text-muted-foreground">
          이미 가입하셨나요?{" "}
          <Link className="font-semibold text-primary" href="/sign-in">
            로그인
          </Link>
        </p>
      </div>
    </div>
  )
}
