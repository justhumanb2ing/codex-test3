import { redirect } from "next/navigation";

import { getCurrentUser } from "@/services/auth-service";
import { listNotifications } from "@/services/notification-service";
import { NotificationPermissionToggle } from "@/components/notifications/notification-permission-toggle";
import { NotificationList } from "@/components/notifications/notification-list";

interface NotificationsPageProps {
  params: Promise<{
    userId?: string;
  }>;
}

export default async function NotificationsPage({
  params,
}: NotificationsPageProps) {
  const { userId } = await params;
  const user = await getCurrentUser();

  if (!user) {
    redirect("/sign-in");
  }

  if (!userId || userId !== user.id) {
    redirect(`/notifications/${user.id}`);
  }

  const result = await listNotifications(user.id);
  const notifications = result.success && result.data ? result.data : [];

  return (
    <section className="space-y-8">
      <NotificationList initialNotifications={notifications} />
    </section>
  );
}
