import Link from "next/link";

import { signOutAction } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/services/auth-service";

export const dynamic = "force-dynamic";

const cardStyles =
  "rounded-2xl border border-border bg-white/80 p-8 shadow-sm backdrop-blur dark:bg-zinc-900/70";

const infoItemStyles = "space-y-1 rounded-xl bg-muted/40 p-4";

export default async function Home() {
  const user = await getCurrentUser();
  
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-10 px-4 py-16 md:py-24">
      <section className={`${cardStyles} space-y-6`}>
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">
          Supabase Auth · Next.js App Router
        </p>
        <h1 className="text-3xl font-semibold leading-tight md:text-4xl">
          서버 액션으로 구성된 인증 플로우 예제
        </h1>
        <p className="text-base text-muted-foreground md:text-lg">
          Supabase 세션을 SSR에서 그대로 활용할 수 있도록 구성했습니다. 로그인,
          회원가입, 로그아웃 페이지와 서버 액션을 참고해 나만의 온보딩 플로우를
          빠르게 구축할 수 있습니다.
        </p>
        <div className="flex flex-wrap gap-3">
          {user ? (
            <>
              <form action={signOutAction}>
                <input type="hidden" name="redirectTo" value="/" />
                <input type="hidden" name="errorRedirect" value="/logout" />
                <Button type="submit" variant="default" className="cursor-pointer">
                  로그아웃
                </Button>
              </form>
              <Button asChild variant="secondary">
                <Link href="/logout">로그아웃 페이지 보기</Link>
              </Button>
            </>
          ) : (
            <>
              <Button asChild>
                <Link href="/login">지금 로그인하기</Link>
              </Button>
              <Button asChild variant="secondary">
                <Link href="/signup">새 계정 만들기</Link>
              </Button>
            </>
          )}
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <article className={cardStyles}>
          <h2 className="text-xl font-semibold">
            {user ? "현재 로그인 정보" : "로그인 상태"}
          </h2>
          <div className="mt-6 space-y-4 text-sm">
            {user ? (
              <>
                <div className={infoItemStyles}>
                  <p className="text-muted-foreground">이메일</p>
                  <p className="font-medium">{user.email}</p>
                </div>
                <div className={infoItemStyles}>
                  <p className="text-muted-foreground">사용자 ID</p>
                  <p className="font-mono text-xs text-foreground">{user.id}</p>
                </div>
                <div className={infoItemStyles}>
                  <p className="text-muted-foreground">최근 접속일</p>
                  <p className="font-medium">
                    {new Date(
                      user.last_sign_in_at ?? user.created_at
                    ).toLocaleString()}
                  </p>
                </div>
              </>
            ) : (
              <p className="rounded-xl bg-muted/30 p-6 text-muted-foreground">
                로그인이 필요한 페이지에 진입하면 Next.js 서버 컴포넌트에서
                Supabase 세션을 바로 조회하고, 필요한 경우 서버 액션으로 인증을
                요구하도록 확장할 수 있습니다.
              </p>
            )}
          </div>
        </article>
        <article className={cardStyles}>
          <h2 className="text-xl font-semibold">다음 단계</h2>
          <ul className="mt-6 space-y-4 text-sm text-muted-foreground">
            <li className="rounded-xl bg-muted/30 p-4">
              필요한 보호된 라우트를 서버 컴포넌트로 구성하고{" "}
              <code className="rounded bg-muted px-1 py-0.5">
                getCurrentUser
              </code>
              를 통해 세션을 확인하세요.
            </li>
            <li className="rounded-xl bg-muted/30 p-4">
              Supabase RLS 정책과 연동하여 사용자별 데이터 접근을 제한할 수
              있습니다.
            </li>
            <li className="rounded-xl bg-muted/30 p-4">
              회원가입 플로우에 추가 필드나 이메일 OTP 검증 등 부가 기능을
              연결해보세요.
            </li>
          </ul>
        </article>
      </section>
    </main>
  );
}
