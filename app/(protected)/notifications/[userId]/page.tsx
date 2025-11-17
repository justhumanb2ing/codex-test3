import { redirect } from "next/navigation"

import { getCurrentUser } from "@/services/auth-service"
import { listNotifications } from "@/services/notification-service"
import { NotificationPermissionToggle } from "@/components/notifications/notification-permission-toggle"
import { NotificationList } from "@/components/notifications/notification-list"

interface NotificationsPageProps {
  params: Promise<{
    userId?: string
  }>
}

export default async function NotificationsPage({
  params,
}: NotificationsPageProps) {
  const { userId } = await params
  const user = await getCurrentUser()

  if (!user) {
    redirect("/sign-in")
  }

  if (!userId || userId !== user.id) {
    redirect(`/notifications/${user.id}`)
  }

  const result = await listNotifications(user.id)
  const notifications = result.success && result.data ? result.data : []

  return (
    <section className="space-y-8">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">
          Notifications
        </p>
        <h1 className="text-2xl font-semibold">내 알림</h1>
        <p className="text-sm text-muted-foreground">
          전체 발표 알림과 개인 맞춤 알림을 한 곳에서 확인하세요.
        </p>
      </div>
      <NotificationPermissionToggle />
      <NotificationList initialNotifications={notifications} />
    </section>
  )
}
