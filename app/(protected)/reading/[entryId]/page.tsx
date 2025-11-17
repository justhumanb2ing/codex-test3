import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/services/auth-service";
import { getReadingEntry } from "@/services/reading-log-service";

interface PageProps {
  params: {
    entryId: string;
  };
}

const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat("ko", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));

export default async function ReadingEntryDetailPage({ params }: PageProps) {
  const { entryId } = await params;
  const user = await getCurrentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const result = await getReadingEntry(user.id, entryId);

  if (!result.success) {
    return (
      <section className="space-y-6">
        <header className="space-y-3">
          <h1 className="text-2xl font-semibold text-foreground">독서 기록</h1>
          <p className="text-sm text-muted-foreground">
            상세 정보를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.
          </p>
        </header>
        <Button asChild>
          <Link href="/reading">목록으로 돌아가기</Link>
        </Button>
      </section>
    );
  }

  const entry = result.data;

  if (!entry) {
    notFound();
  }

  return (
    <article className="space-y-10">
      <header className="space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              {formatDateTime(entry.createdAt)}
            </p>
            <h1 className="text-3xl font-semibold text-foreground">
              {entry.bookTitle}
            </h1>
          </div>
          <Button asChild variant="outline">
            <Link href="/reading">목록으로 돌아가기</Link>
          </Button>
        </div>
        {entry.userKeywords.length > 0 ? (
          <ul className="flex flex-wrap gap-2">
            {entry.userKeywords.map((keyword) => (
              <li
                key={keyword}
                className="rounded-full border border-border/70 bg-muted/40 px-3 py-1 text-xs font-medium text-muted-foreground"
              >
                #{keyword}
              </li>
            ))}
          </ul>
        ) : null}
      </header>
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">전체 감상문</h2>
        <div className="rounded-lg border border-border/70 bg-card p-5 text-sm leading-relaxed text-muted-foreground">
          {entry.content.split("\n").map((paragraph, index) => (
            <p key={`${paragraph}-${index}`} className="mb-3 last:mb-0">
              {paragraph}
            </p>
          ))}
        </div>
      </section>
    </article>
  );
}
