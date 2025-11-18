"use client";

import { useEffect, useState, useTransition } from "react";
import { ChevronRightIcon, EllipsisVertical } from "lucide-react";

import { deleteReadingEntryAction } from "@/app/(protected)/reading/actions";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ReadingEntry } from "@/services/reading-log-service";

interface ReadingEntryListProps {
  entries: ReadingEntry[];
}

const formatRelativeDate = (value: string) => {
  const targetDate = new Date(value);
  const today = new Date();

  const normalize = (date: Date) => {
    const normalized = new Date(date);
    normalized.setHours(0, 0, 0, 0);
    return normalized;
  };

  const startOfToday = normalize(today);
  const startOfTarget = normalize(targetDate);
  const diffInMs = startOfToday.getTime() - startOfTarget.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays <= 0) {
    return "오늘";
  }

  if (diffInDays < 7) {
    return `${diffInDays}일`;
  }

  const year = targetDate.getFullYear();
  const month = String(targetDate.getMonth() + 1).padStart(2, "0");
  const day = String(targetDate.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const buildPreview = (content: string) => content.trim();

const buildEntryOwnerLabel = (entry: ReadingEntry) => {
  if (entry.authorName && entry.authorName.trim().length > 0) {
    return entry.authorName;
  }
  return "이름 없는 사용자";
};

export const ReadingEntryList = ({ entries }: ReadingEntryListProps) => {
  const [entryList, setEntryList] = useState(entries);
  const [entryPendingDeletion, setEntryPendingDeletion] =
    useState<ReadingEntry | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [isDeleting, startTransition] = useTransition();

  useEffect(() => {
    setEntryList(entries);
  }, [entries]);

  const handleRequestDelete = (entry: ReadingEntry) => {
    setFeedbackMessage(null);
    setEntryPendingDeletion(entry);
  };

  const closeConfirmationModal = () => {
    setEntryPendingDeletion(null);
  };

  const handleConfirmDelete = () => {
    if (!entryPendingDeletion) {
      return;
    }

    const entryId = entryPendingDeletion.id;
    closeConfirmationModal();

    startTransition(async () => {
      const result = await deleteReadingEntryAction(entryId);

      if (!result.success) {
        setFeedbackMessage(
          result.error ?? "기록을 삭제하는 중 문제가 발생했습니다."
        );
        return;
      }

      setFeedbackMessage(null);
      setEntryList((prev) => prev.filter((entry) => entry.id !== entryId));
    });
  };

  if (entryList.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border/80 bg-muted/30 px-4 py-6 text-center text-sm text-muted-foreground">
        아직 작성한 독서 기록이 없습니다. 첫 감상을 남겨보세요!
      </p>
    );
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
            <article className="rounded-lg bg-card p-4 pr-14 transition hover:bg-background-service">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
                    <span className="text-base font-medium text-foreground">
                      {buildEntryOwnerLabel(entry)}
                    </span>
                    <span>
                      <ChevronRightIcon size={12} />
                    </span>
                    <span className="text-base font-medium text-foreground">
                      {entry.bookTitle}
                    </span>
                  </div>
                  <span className="text-sm text-muted-foreground mb-0.5">
                    {formatRelativeDate(entry.createdAt)}
                  </span>
                </div>
                <p className="whitespace-pre-line text-base text-foreground">
                  {buildPreview(entry.content)}
                </p>
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
            </article>
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
              &quot;{entryPendingDeletion.bookTitle}&quot;에 대한 감상을
              삭제하면 다시 복구할 수 없습니다. 계속하시겠어요?
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
  );
};
