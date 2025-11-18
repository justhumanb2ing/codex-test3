"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { ReadingEntryForm } from "@/components/reading/reading-entry-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface ReadingEntryModalProps {
  defaultOpen?: boolean;
  trigger?: ReactNode;
  redirectOnClose?: string | null;
  currentUserName?: string;
}

export const ReadingEntryModal = ({
  defaultOpen = false,
  trigger,
  redirectOnClose = "/reading",
  currentUserName = "사용자",
}: ReadingEntryModalProps) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(defaultOpen);

  useEffect(() => {
    setIsOpen(defaultOpen);
  }, [defaultOpen]);

  const closeModal = () => {
    setIsOpen(false);
    if (redirectOnClose) {
      router.replace(redirectOnClose, { scroll: false });
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (open) {
      setIsOpen(true);
      return;
    }
    closeModal();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger ? trigger : <Button type="button">새 기록 작성</Button>}
      </DialogTrigger>
      <DialogContent
        className="w-full max-w-3xl rounded-3xl border border-border/60 bg-background/95 text-left shadow-2xl p-0 py-3 max-h-[calc(100vh-4rem)] overflow-hidden grid-rows-[auto,1fr]"
        showCloseButton={false}
      >
        <DialogHeader className="sm:text-center flex flex-row px-4 items-center justify-between border-b pb-3">
          <div className="flex flex-1 justify-start">
            <DialogClose asChild>
              <Button variant={"ghost"} className="text-lg text-foreground">
                취소
              </Button>
            </DialogClose>
          </div>
          <DialogTitle className="text-lg font-bold flex justify-center flex-1">
            새로운 기록
          </DialogTitle>
          <div className="flex flex-1" aria-hidden="true" />
        </DialogHeader>
        <ReadingEntryForm currentUserName={currentUserName} />
      </DialogContent>
    </Dialog>
  );
};
