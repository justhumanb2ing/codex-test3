import { redirect } from "next/navigation"

import { ReadingEntryList } from "@/components/reading/reading-entry-list"
import { ReadingEntryModal } from "@/components/reading/reading-entry-modal"
import { getCurrentUser } from "@/services/auth-service"
import { listReadingEntries } from "@/services/reading-log-service"

interface ReadingEntriesPageProps {
  searchParams?: Record<string, string | string[] | undefined>
}

export default async function ReadingEntriesPage({
  searchParams,
}: ReadingEntriesPageProps = {}) {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/sign-in")
  }

  const result = await listReadingEntries(user.id)
  const entries = result.success && result.data ? result.data : []
  const shouldOpenModal =
    typeof searchParams?.compose === "string" &&
    searchParams.compose.toLowerCase() === "new"

  return (
    <section className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">독서 기록</h1>
          <p className="text-sm text-muted-foreground">
            읽고 느낀 점을 간단한 키워드와 함께 기록해보세요.
          </p>
        </div>
        <ReadingEntryModal defaultOpen={shouldOpenModal} />
      </div>
      {!result.success && result.error ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {result.error}
        </p>
      ) : null}
      <ReadingEntryList entries={entries} />
    </section>
  )
}
