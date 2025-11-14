"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import {
  updateProfileAction,
  type UpdateProfileActionState,
} from "@/app/(protected)/profile/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "../ui/input";
import Image from "next/image";

interface ProfileEditModalProps {
  defaultName: string;
  defaultAvatarUrl?: string;
}

const buildInitialState = (success?: boolean): UpdateProfileActionState => ({
  error: undefined,
  success,
});

export const ProfileEditModal = ({
  defaultName,
  defaultAvatarUrl,
}: ProfileEditModalProps) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [preview, setPreview] = useState<string | undefined>(defaultAvatarUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const [state, formAction, isPending] = useActionState(
    updateProfileAction,
    buildInitialState()
  );

  useEffect(() => {
    if (state?.success) {
      setIsOpen(false);
      formRef.current?.reset();
      router.refresh();
    }
  }, [state?.success, router]);

  useEffect(() => {
    setPreview(defaultAvatarUrl);
  }, [defaultAvatarUrl]);

  const closeModal = () => {
    setIsOpen(false);
    setPreview((prev) => prev ?? defaultAvatarUrl);
    formRef.current?.reset();
  };

  const handleOpenChange = (open: boolean) => {
    if (open) {
      setIsOpen(true);
      return;
    }
    closeModal();
  };

  const handleOpen = () => {
    setIsOpen(true);
  };

  const handleFileChange = () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      setPreview(defaultAvatarUrl);
      return;
    }

    const url = URL.createObjectURL(file);
    setPreview(url);
  };

  const avatarPreview = useMemo(
    () => preview ?? defaultAvatarUrl,
    [preview, defaultAvatarUrl]
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          onClick={handleOpen}
          className="shadow-none text-base"
        >
          프로필 편집
        </Button>
      </DialogTrigger>
      <DialogContent
        showCloseButton={false}
        className="w-full max-w-lg rounded-3xl border border-border/60 bg-background/95 p-6 text-left shadow-2xl"
      >
        <DialogHeader hidden aria-hidden>
          <DialogTitle
            className="text-2xl font-semibold text-foreground"
            hidden
            aria-hidden
          >
            프로필 편집
          </DialogTitle>
        </DialogHeader>
        <form ref={formRef} action={formAction} className="space-y-6">
          <input
            type="hidden"
            name="currentAvatar"
            value={defaultAvatarUrl ?? ""}
          />
          <div className="flex gap-5 flex-row-reverse items-center">
            <div className="flex items-center gap-5">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="relative focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-full"
                aria-label="프로필 이미지 변경"
              >
                {avatarPreview ? (
                  <Image
                    src={avatarPreview}
                    alt="프로필 이미지 미리보기"
                    className="size-16 rounded-full border border-border/60 object-cover"
                    width={64}
                    height={64}
                  />
                ) : (
                  <div className="flex size-16 items-center justify-center rounded-full border border-dashed border-border/70 bg-muted/40 text-sm font-medium text-muted-foreground">
                    IMG
                  </div>
                )}
              </button>
              <input
                ref={fileInputRef}
                name="avatar"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
            <div className="flex-1 space-y-1 border-b">
              <label htmlFor="fullName" className="text-sm font-medium">
                이름
              </label>
              <Input
                id="fullName"
                name="fullName"
                type="text"
                defaultValue={defaultName}
                autoComplete="off"
                className="w-full rounded-2xl bg-transparent px-0 py-5 text-sm focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-none shadow-none border-none ring-0 outline-none"
                placeholder="이름을 입력하세요"
              />
            </div>
          </div>
          {state?.error ? (
            <p className="rounded-2xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {state.error}
            </p>
          ) : null}
          <DialogFooter>
            <div className="flex gap-3 w-full">
              <Button
                type="submit"
                disabled={isPending}
                className="w-full py-6 font-medium"
                size={"lg"}
              >
                {isPending ? "변경 중..." : "완료"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
