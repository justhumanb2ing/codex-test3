"use client";

import { useActionState, useState } from "react";

import {
  createReadingEntryAction,
  type CreateReadingEntryActionState,
} from "@/app/(protected)/reading/actions";
import { Button } from "@/components/ui/button";

interface ReadingEntryFormProps {
  initialErrorMessage?: string;
}

const buildInitialState = (error?: string): CreateReadingEntryActionState => ({
  error,
});

export const ReadingEntryForm = ({
  initialErrorMessage,
}: ReadingEntryFormProps) => {
  const [state, formAction, isPending] = useActionState(
    createReadingEntryAction,
    buildInitialState(initialErrorMessage)
  );
  const [bookTitle, setBookTitle] = useState("");
  const [content, setContent] = useState("");
  const [keywords, setKeywords] = useState("");

  return (
    <form action={formAction} className="space-y-6">
      <div className="space-y-2">
        <label
          className="text-sm font-medium text-foreground"
          htmlFor="bookTitle"
        >
          책 제목
        </label>
        <input
          id="bookTitle"
          name="bookTitle"
          type="text"
          required
          value={bookTitle}
          onChange={(event) => setBookTitle(event.target.value)}
          className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          placeholder="예: 데미안"
        />
      </div>
      <div className="space-y-2">
        <label
          className="text-sm font-medium text-foreground"
          htmlFor="content"
        >
          감상문
        </label>
        <textarea
          id="content"
          name="content"
          required
          value={content}
          onChange={(event) => setContent(event.target.value)}
          className="h-48 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          placeholder="책을 읽고 느낀 점을 자유롭게 작성해주세요."
        />
        <p className="text-xs text-muted-foreground">
          작성한 내용은 AI 요약과 감정 분석에 사용됩니다.
        </p>
      </div>
      <div className="space-y-2">
        <label
          className="text-sm font-medium text-foreground"
          htmlFor="keywords"
        >
          키워드 (쉼표로 구분)
        </label>
        <input
          id="keywords"
          name="keywords"
          type="text"
          value={keywords}
          onChange={(event) => setKeywords(event.target.value)}
          className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          placeholder="예: 성장, 우정, 예술"
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
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "등록 중..." : "기록 저장"}
      </Button>
    </form>
  );
};
