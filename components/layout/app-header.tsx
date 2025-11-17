import { buildProfileName } from "@/lib/profile-utils";
import { getCurrentUser } from "@/services/auth-service";
import { AppNavigation } from "./app-navigation";

const buildProfile = (user: Awaited<ReturnType<typeof getCurrentUser>>) => {
  if (!user) return null;
  const metadata = (user.user_metadata ?? {}) as Record<string, unknown>;
  const firstName =
    user.firstName ?? (metadata?.name as string | undefined) ?? "";
  const lastName =
    user.lastName ?? (metadata?.nickname as string | undefined) ?? "";
  const name =
    [lastName, firstName].filter((part) => part?.length).join(" ") ||
    buildProfileName(metadata, user.email ?? undefined);
  const avatarUrl =
    (metadata?.custom_avatar_url as string | undefined) ??
    (metadata?.avatar_url as string | undefined) ??
    (metadata?.picture as string | undefined);

  return {
    email: user.email ?? "",
    userId: user.id,
    name,
    avatarUrl,
  };
};

export const AppHeader = async () => {
  const user = await getCurrentUser();
  const profile = buildProfile(user);

  return (
    <div className="order-last w-full md:order-first md:w-20 sticky bottom-0">
      <aside className="hidden h-full flex-col bg-background/95 px-2 py-6 md:flex md:sticky md:top-0 md:h-screen">
        <AppNavigation profile={profile} variant="vertical" />
      </aside>
      <div className="md:hidden">
        <div className="bg-background/80 backdrop-blur-sm px-2">
          <AppNavigation profile={profile} variant="horizontal" />
        </div>
      </div>
    </div>
  );
};
