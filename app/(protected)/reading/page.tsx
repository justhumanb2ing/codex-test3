import Link from "next/link"
import { redirect } from "next/navigation"

import { ReadingEntryList } from "@/components/reading/reading-entry-list"
import { Button } from "@/components/ui/button"
import { getCurrentUser } from "@/services/auth-service"
import { listReadingEntries } from "@/services/reading-log-service"

export default async function ReadingEntriesPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  const result = await listReadingEntries(user.id)
  const entries = result.success && result.data ? result.data : []

  return (
    <section className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">독서 기록</h1>
          <p className="text-sm text-muted-foreground">
            읽고 느낀 점을 간단한 키워드와 함께 기록해보세요.
          </p>
        </div>
        <Button asChild>
          <Link href="/reading/new">새 기록 작성</Link>
        </Button>
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
