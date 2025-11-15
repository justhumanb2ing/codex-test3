import Link from "next/link";

import { NotificationTester } from "@/components/notifications/notification-tester";
import { BookSearchBar } from "@/components/reading/book-search-bar";

export default function HomePage() {
  return (
    <section className="space-y-8 py-10">
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">환영합니다</h1>
        <p className="text-muted-foreground">
          상단 프로필 메뉴를 통해 로그인/회원가입을 진행하거나 현재 세션을
          확인하세요.
        </p>
        <Link
          className="inline-flex w-fit items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
          href="/reading"
        >
          독서 기록 바로가기
        </Link>
      </div>
      <div className="rounded-3xl border border-border/70 bg-card/50 p-6 shadow-sm">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">
          Search
        </p>
        <h2 className="text-xl font-semibold text-foreground">독서 검색</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Threads 스타일의 검색 UI를 미리 체험해보세요.
        </p>
        <div className="mt-6">
          <BookSearchBar />
        </div>
      </div>
      <NotificationTester />
    </section>
  );
}
