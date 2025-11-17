
import { cache } from "react";
import { currentUser } from "@clerk/nextjs/server";

export interface AppUser {
  id: string;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  user_metadata: Record<string, unknown>;
}

/**
 * SSR 환경에서 현재 인증된 사용자를 반환합니다.
 */
export const getCurrentUser = cache(async (): Promise<AppUser | null> => {
  try {
    const user = await currentUser();

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      email: user.primaryEmailAddress?.emailAddress ?? null,
      firstName: user.firstName ?? null,
      lastName: user.lastName ?? null,
      user_metadata: {
        username: user.username,
        full_name: user.fullName,
        name: user.firstName,
        nickname: user.lastName,
        avatar_url: user.imageUrl,
      },
    };
  } catch {
    return null;
  }
});
