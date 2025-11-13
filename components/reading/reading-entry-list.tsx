import Link from "next/link"

import type { ReadingEntry } from "@/services/reading-log-service"

interface ReadingEntryListProps {
  entries: ReadingEntry[]
}

const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat("ko", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value))

export const ReadingEntryList = ({ entries }: ReadingEntryListProps) => {
  if (entries.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border/80 bg-muted/30 px-4 py-6 text-center text-sm text-muted-foreground">
        아직 작성한 독서 기록이 없습니다. 첫 감상을 남겨보세요!
      </p>
    )
  }

  return (
    <ul className="space-y-4">
      {entries.map((entry) => (
        <li
          key={entry.id}
          className="rounded-lg border border-border/70 bg-card p-4 transition hover:border-primary/60 hover:shadow-sm"
        >
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                <Link href={`/reading/${entry.id}`} className="hover:underline">
                  {entry.bookTitle}
                </Link>
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {entry.aiSummary}
              </p>
            </div>
            <div className="text-right text-xs text-muted-foreground">
              {formatDateTime(entry.createdAt)}
            </div>
          </div>
          {entry.aiTopics.length > 0 ? (
            <ul className="mt-3 flex flex-wrap gap-2">
              {entry.aiTopics.slice(0, 3).map((topic) => (
                <li
                  key={topic.id}
                  className="rounded-md bg-primary/10 px-2 py-1 text-[11px] font-medium uppercase tracking-wider text-primary"
                >
                  {topic.value}
                </li>
              ))}
            </ul>
          ) : null}
        </li>
      ))}
    </ul>
  )
}
