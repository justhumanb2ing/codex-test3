import { notFound } from "next/navigation";
import Image from "next/image";

import { ProfileEditModal } from "@/components/profile/profile-edit-modal";
import { ProfileTabs } from "@/components/profile/profile-tabs";
import { getCurrentUser } from "@/services/auth-service";
import { listReadingEntries } from "@/services/reading-log-service";
import { buildProfileName } from "@/lib/profile-utils";

const buildAvatarUrl = (metadata: Record<string, unknown>) => {
  const candidates = ["custom_avatar_url", "avatar_url", "picture"];
  for (const field of candidates) {
    const value = metadata?.[field];
    if (typeof value === "string" && value.trim().length > 0) {
      return value;
    }
  }
  return undefined;
};

const buildInitials = (name: string) => {
  const [first = "", second = ""] = name.split(" ");
  const initials = `${first[0] ?? ""}${second[0] ?? ""}`.trim();
  if (initials) {
    return initials.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase() || "US";
};

interface ProfileSettingsPageProps {
  params: Promise<{
    userId: string | undefined;
  }>;
}

export default async function ProfileSettingsPage({
  params,
}: ProfileSettingsPageProps) {
  const { userId } = await params;

  if (!userId) {
    notFound();
  }

  const [currentUser, readingsResult] = await Promise.all([
    getCurrentUser(),
    listReadingEntries(userId),
  ]);

  if (!currentUser || currentUser.id !== userId) {
    notFound();
  }

  const entries =
    readingsResult.success && readingsResult.data ? readingsResult.data : [];
  const historyCount = entries.length;
  const hasEnoughHistory = historyCount > 5;

  const metadata = (currentUser.user_metadata ?? {}) as Record<string, unknown>;
  const firstName =
    currentUser.firstName ?? (metadata?.name as string | undefined) ?? "";
  const lastName =
    currentUser.lastName ?? (metadata?.nickname as string | undefined) ?? "";
  const profileName =
    [lastName, firstName].filter((part) => part?.length).join("") ||
    buildProfileName(metadata, currentUser.email ?? undefined);
  const avatarUrl = buildAvatarUrl(metadata);
  const initials = buildInitials(profileName);
  const email = currentUser.email ?? "이메일 정보가 없습니다.";

  return (
    <main className="space-y-10">
      <section className="space-y-6 px-6">
        <div className="flex flex-col gap-6">
          <div className="flex items-center flex-row-reverse justify-between w-full">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt={`${profileName} 프로필 이미지`}
                className="size-24 rounded-full border border-border object-cover"
                width={84}
                height={84}
              />
            ) : (
              <div className="flex size-20 items-center justify-center rounded-full border border-border/70 bg-muted/50 text-lg font-semibold text-muted-foreground">
                {initials}
              </div>
            )}
            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-foreground">
                {profileName}
              </h1>
              <p className="text-sm text-muted-foreground">{email}</p>
            </div>
          </div>
          <div>
            <ProfileEditModal
              defaultFirstName={firstName}
              defaultLastName={lastName}
              defaultAvatarUrl={avatarUrl}
            />
          </div>
        </div>
      </section>
      <ProfileTabs
        entries={entries}
        historyCount={historyCount}
        hasEnoughHistory={hasEnoughHistory}
      />
    </main>
  );
}
