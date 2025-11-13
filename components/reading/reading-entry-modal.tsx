"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { ReadingEntryForm } from "@/components/reading/reading-entry-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface ReadingEntryModalProps {
  defaultOpen?: boolean;
}

export const ReadingEntryModal = ({
  defaultOpen = false,
}: ReadingEntryModalProps) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(defaultOpen);

  useEffect(() => {
    setIsOpen(defaultOpen);
  }, [defaultOpen]);

  const closeModal = () => {
    setIsOpen(false);
    router.replace("/reading", { scroll: false });
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
        <Button type="button">새 기록 작성</Button>
      </DialogTrigger>
      <DialogContent className="w-full max-w-2xl rounded-3xl border border-border/60 bg-background/95 p-6 text-left shadow-2xl">
        <DialogHeader className="sm:text-center">
          <DialogTitle className="text-2xl font-semibold">
            새로운 기록
          </DialogTitle>
        </DialogHeader>
        <ReadingEntryForm />
      </DialogContent>
    </Dialog>
  );
};
