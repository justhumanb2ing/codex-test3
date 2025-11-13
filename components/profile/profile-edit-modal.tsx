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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

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
        <Button type="button" variant="outline" onClick={handleOpen}>
          프로필 수정
        </Button>
      </DialogTrigger>
      <DialogContent
        showCloseButton={false}
        className="w-full max-w-lg rounded-3xl border border-border/60 bg-background/95 p-6 text-left shadow-2xl"
      >
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold text-foreground">
            프로필 수정
          </DialogTitle>
        </DialogHeader>
        <form ref={formRef} action={formAction} className="space-y-6">
          <input
            type="hidden"
            name="currentAvatar"
            value={defaultAvatarUrl ?? ""}
          />
          <div className="flex items-center gap-5">
            <div className="relative">
              {avatarPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarPreview}
                  alt="프로필 이미지 미리보기"
                  className="size-20 rounded-full border border-border/60 object-cover"
                />
              ) : (
                <div className="flex size-20 items-center justify-center rounded-full border border-dashed border-border/70 bg-muted/40 text-sm font-medium text-muted-foreground">
                  IMG
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                이미지 변경
              </Button>
              <p className="text-xs text-muted-foreground">
                JPG, PNG, WEBP 형식 이미지를 업로드하세요.
              </p>
              <input
                ref={fileInputRef}
                name="avatar"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label
              htmlFor="fullName"
              className="text-sm font-medium text-muted-foreground"
            >
              이름
            </label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              defaultValue={defaultName}
              className="w-full rounded-2xl border border-border/70 bg-transparent px-4 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              placeholder="이름을 입력하세요"
            />
          </div>
          {state?.error ? (
            <p className="rounded-2xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {state.error}
            </p>
          ) : null}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={closeModal}>
              아니오
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "수정 중..." : "수정"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
