"use server";

import { revalidatePath } from "next/cache";
import { auth, clerkClient } from "@clerk/nextjs/server";

export interface UpdateProfileActionState {
  error?: string;
  success?: boolean;
}

const buildState = (
  overrides: Partial<UpdateProfileActionState>
): UpdateProfileActionState => ({
  error: undefined,
  success: false,
  ...overrides,
});

export const updateProfileAction = async (
  _prevState: UpdateProfileActionState,
  formData: FormData
): Promise<UpdateProfileActionState> => {
  const { userId } = await auth();

  if (!userId) {
    return buildState({ error: "로그인이 필요합니다." });
  }

  const firstName = formData.get("firstName");
  const lastName = formData.get("lastName");
  const avatar = formData.get("avatar");

  if (typeof firstName !== "string" || typeof lastName !== "string") {
    return buildState({ error: "이름과 성을 모두 입력해주세요." });
  }

  const trimmedFirst = firstName.trim();
  const trimmedLast = lastName.trim();

  if (!trimmedFirst || !trimmedLast) {
    return buildState({ error: "이름과 성을 모두 입력해주세요." });
  }

  const clerk = await clerkClient();

  try {
    clerk.users.updateUser(userId, {
      firstName: trimmedFirst,
      lastName: trimmedLast,
    });

    if (avatar instanceof File && avatar.size > 0) {
      clerk.users.updateUserProfileImage(userId, {
        file: avatar,
      });
    }
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "프로필을 업데이트하지 못했습니다.";
    return buildState({ error: message });
  }

  revalidatePath(`/profile/${userId}`);
  revalidatePath("/", "layout");

  return buildState({ success: true });
};
