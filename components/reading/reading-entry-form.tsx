"use client";

import {
  useActionState,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
} from "react";

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
const MODAL_VERTICAL_MARGIN_PX = 64;
const MIN_TEXTAREA_HEIGHT_PX = 192;

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
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const displayName =
    currentUserName.trim().length > 0 ? currentUserName : "사용자";
  const getMaxTextareaHeight = (nonTextareaHeight: number) => {
    if (typeof window === "undefined") {
      return MIN_TEXTAREA_HEIGHT_PX;
    }
    const viewportHeight = window.innerHeight;
    const maxModalHeight = Math.max(
      viewportHeight - MODAL_VERTICAL_MARGIN_PX,
      MIN_TEXTAREA_HEIGHT_PX
    );
    const availableHeight = maxModalHeight - nonTextareaHeight;
    if (availableHeight <= MIN_TEXTAREA_HEIGHT_PX) {
      return Math.max(availableHeight, 0);
    }
    return availableHeight;
  };
  const adjustTextareaHeight = (element: HTMLTextAreaElement | null) => {
    if (!element) {
      return;
    }
    const dialogContent = element.closest(
      "[data-slot='dialog-content']"
    ) as HTMLElement | null;
    const previousHeight = element.offsetHeight;
    const nonTextareaHeight =
      dialogContent && previousHeight > 0
        ? Math.max(dialogContent.scrollHeight - previousHeight, 0)
        : 0;
    element.style.height = "auto";
    const desiredHeight = element.scrollHeight;
    const maxHeight = getMaxTextareaHeight(nonTextareaHeight);
    const resolvedHeight = Math.min(desiredHeight, maxHeight);
    element.style.height = `${resolvedHeight}px`;
    element.style.overflowY =
      desiredHeight > resolvedHeight ? "auto" : "hidden";
  };
  const handleContentChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setContent(event.target.value);
    adjustTextareaHeight(event.currentTarget);
  };

  useEffect(() => {
    adjustTextareaHeight(textareaRef.current);
    if (typeof window === "undefined") {
      return;
    }
    const resizeHandler = () => {
      adjustTextareaHeight(textareaRef.current);
    };
    window.addEventListener("resize", resizeHandler);
    return () => {
      window.removeEventListener("resize", resizeHandler);
    };
  }, []);

  return (
    <div className="flex h-full min-h-0 flex-col gap-4 px-6 py-4 overflow-hidden">
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
      <form
        action={formAction}
        className="flex flex-1 min-h-0 flex-col gap-6 overflow-hidden pb-4"
      >
        <input type="hidden" name="bookTitle" value={bookTitle} />
        <div className="flex-1 min-h-0 overflow-hidden">
          <Textarea
            id="content"
            name="content"
            required
            autoFocus
            value={content}
            onChange={handleContentChange}
            ref={textareaRef}
            className="min-h-48 w-full rounded-none border-none bg-transparent p-0 text-base transition focus-visible:border-transparent focus-visible:ring-0 shadow-none resize-none placeholder:text-base overflow-hidden"
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
          className="w-full text-base shrink-0"
          size={"lg"}
          disabled={isPending}
        >
          {isPending ? "등록 중..." : "게시"}
        </Button>
      </form>
    </div>
  );
};
