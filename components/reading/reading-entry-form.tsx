"use client";

import { useActionState, useState } from "react";

import {
  createReadingEntryAction,
  type CreateReadingEntryActionState,
} from "@/app/(protected)/reading/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ChevronRightIcon } from "lucide-react";

interface ReadingEntryFormProps {
  initialErrorMessage?: string;
  currentUserName?: string;
}

const buildInitialState = (error?: string): CreateReadingEntryActionState => ({
  error,
});

export const ReadingEntryForm = ({
  initialErrorMessage,
  currentUserName = "사용자",
}: ReadingEntryFormProps) => {
  const [state, formAction, isPending] = useActionState(
    createReadingEntryAction,
    buildInitialState(initialErrorMessage)
  );
  const [bookTitle, setBookTitle] = useState("");
  const [content, setContent] = useState("");
  const displayName =
    currentUserName.trim().length > 0 ? currentUserName : "사용자";

  return (
    <div className="space-y-2 px-6">
      <div
        className="text-base text-muted-foreground flex items-center gap-1 w-full"
        aria-label={`${displayName} > 책 추가`}
      >
        <span className="font-bold text-foreground">{displayName}</span>
        <ChevronRightIcon className="size-4" />
        <Input
          id="bookTitle"
          name="bookTitle"
          type="text"
          required
          autoComplete="off"
          value={bookTitle}
          onChange={(event) => setBookTitle(event.target.value)}
          className="rounded-none border-none bg-transparent px-0 transition focus-visible:border-transparent focus-visible:ring-0 shadow-none w-40 placeholder:text-base"
          placeholder="책 추가"
        />
      </div>
      <form action={formAction} className="space-y-6 pb-4">
        <div className="space-y-2">
          <Textarea
            id="content"
            name="content"
            required
            autoFocus
            value={content}
            onChange={(event) => setContent(event.target.value)}
            className="h-48 w-full rounded-none border-none bg-transparent p-0 text-base transition focus-visible:border-transparent focus-visible:ring-0 shadow-none resize-none placeholder:text-base"
            placeholder="어떤 감상이 있었나요?"
          />
        </div>
        {state?.error ? (
          <p
            role="alert"
            className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          >
            {state.error}
          </p>
        ) : null}
        <Button
          type="submit"
          className="w-full text-base"
          size={"lg"}
          disabled={isPending}
        >
          {isPending ? "등록 중..." : "게시"}
        </Button>
      </form>
    </div>
  );
};
