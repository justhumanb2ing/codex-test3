import Link from "next/link";

export default function HomePage() {
  return (
    <section className="space-y-6 py-10">
      <h1 className="text-2xl font-semibold">환영합니다</h1>
      <p className="text-muted-foreground">
        상단 프로필 메뉴를 통해 로그인/회원가입을 진행하거나 현재 세션을
        확인하세요.
      </p>
      <Link className="inline-flex w-fit items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90" href="/reading">
        독서 기록 바로가기
      </Link>
    </section>
  );
}
