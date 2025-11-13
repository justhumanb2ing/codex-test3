"use client"

import { useEffect, useState, useTransition } from "react"
import Link from "next/link"
import { EllipsisVertical } from "lucide-react"

import { deleteReadingEntryAction } from "@/app/(protected)/reading/actions"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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

const buildPreview = (content: string) =>
  content
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .join(" ")

export const ReadingEntryList = ({ entries }: ReadingEntryListProps) => {
  const [entryList, setEntryList] = useState(entries)
  const [entryPendingDeletion, setEntryPendingDeletion] =
    useState<ReadingEntry | null>(null)
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null)
  const [isDeleting, startTransition] = useTransition()

  useEffect(() => {
    setEntryList(entries)
  }, [entries])

  const handleRequestDelete = (entry: ReadingEntry) => {
    setFeedbackMessage(null)
    setEntryPendingDeletion(entry)
  }

  const closeConfirmationModal = () => {
    setEntryPendingDeletion(null)
  }

  const handleConfirmDelete = () => {
    if (!entryPendingDeletion) {
      return
    }

    const entryId = entryPendingDeletion.id
    closeConfirmationModal()

    startTransition(async () => {
      const result = await deleteReadingEntryAction(entryId)

      if (!result.success) {
        setFeedbackMessage(
          result.error ?? "기록을 삭제하는 중 문제가 발생했습니다.",
        )
        return
      }

      setFeedbackMessage(null)
      setEntryList((prev) => prev.filter((entry) => entry.id !== entryId))
    })
  }

  if (entryList.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border/80 bg-muted/30 px-4 py-6 text-center text-sm text-muted-foreground">
        아직 작성한 독서 기록이 없습니다. 첫 감상을 남겨보세요!
      </p>
    )
  }

  return (
    <>
      {feedbackMessage ? (
        <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {feedbackMessage}
        </p>
      ) : null}
      <ul className="space-y-4">
        {entryList.map((entry) => (
          <li key={entry.id} className="relative">
            <Link
              href={`/reading/${entry.id}`}
              className="block rounded-lg border border-border/70 bg-card p-4 pr-14 transition hover:border-primary/60 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    {entry.bookTitle}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                    {buildPreview(entry.content)}
                  </p>
                </div>
                <div className="text-right text-xs text-muted-foreground">
                  {formatDateTime(entry.createdAt)}
                </div>
              </div>
              {entry.userKeywords.length > 0 ? (
                <ul className="mt-3 flex flex-wrap gap-2">
                  {entry.userKeywords.map((keyword) => (
                    <li
                      key={keyword}
                      className="rounded-full border border-border/70 bg-muted/40 px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground"
                    >
                      #{keyword}
                    </li>
                  ))}
                </ul>
              ) : null}
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="absolute right-3 top-3 z-10 rounded-full border border-transparent text-muted-foreground hover:border-border hover:bg-transparent hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary/60"
                  aria-label={`${entry.bookTitle} 메뉴 열기`}
                >
                  <EllipsisVertical className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onSelect={() => handleRequestDelete(entry)}
                >
                  삭제
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </li>
        ))}
      </ul>
      {entryPendingDeletion ? (
        <div
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="reading-entry-delete-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 px-4 backdrop-blur-sm"
        >
          <div className="w-full max-w-sm rounded-lg border bg-card p-6 shadow-xl">
            <h4
              id="reading-entry-delete-title"
              className="text-lg font-semibold text-foreground"
            >
              기록을 삭제할까요?
            </h4>
            <p className="mt-2 text-sm text-muted-foreground">
              "{entryPendingDeletion.bookTitle}"에 대한 감상을 삭제하면 다시
              복구할 수 없습니다. 계속하시겠어요?
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={closeConfirmationModal}
                disabled={isDeleting}
              >
                아니오
              </Button>
              <Button
                variant="destructive"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
              >
                삭제
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
