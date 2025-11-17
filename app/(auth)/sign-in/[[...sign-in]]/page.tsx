import Link from "next/link"
import { SignIn } from "@clerk/nextjs"

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-16">
      <div className="w-full max-w-md space-y-6 rounded-2xl border border-border/70 bg-card/95 p-6 shadow-lg backdrop-blur">
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">로그인</h1>
          <p className="text-sm text-muted-foreground">
            Clerk 계정으로 Codex를 이용해 보세요.
          </p>
        </div>
        <SignIn path="/sign-in" routing="path" signUpUrl="/sign-up" />
        <p className="text-center text-sm text-muted-foreground">
          아직 계정이 없으신가요?{" "}
          <Link className="font-semibold text-primary" href="/sign-up">
            회원가입
          </Link>
        </p>
      </div>
    </div>
  )
}
