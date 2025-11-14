import { getCurrentUser } from "@/services/auth-service";
import { buildProfileName } from "@/lib/profile-utils";
import { AppNavigation } from "./app-navigation";

const buildProfile = (user: Awaited<ReturnType<typeof getCurrentUser>>) => {
  if (!user) return null;
  const metadata = user.user_metadata ?? {};
  const name = buildProfileName(
    metadata as Record<string, unknown>,
    user.email ?? undefined
  );
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
    <>
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-20 flex-col bg-background/95 px-2 py-6 md:flex">
        <AppNavigation profile={profile} variant="vertical" />
      </aside>
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-sm md:hidden px-2">
        <AppNavigation profile={profile} variant="horizontal" />
      </div>
    </>
  );
};
