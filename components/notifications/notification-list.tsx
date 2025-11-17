"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemHeader,
  ItemTitle,
} from "@/components/ui/item";
import { formatRelativeDate } from "@/lib/format-relative-date";
import { cn } from "@/lib/utils";
import type { NotificationRecord } from "@/services/notification-service";
import { useSwipeableItem } from "@/hooks/use-swipeable-item";

interface NotificationListProps {
  initialNotifications: NotificationRecord[];
}

const SwipeableNotificationItem = ({
  notification,
  onDismiss,
  onMarkRead,
}: {
  notification: NotificationRecord;
  onDismiss: (id: string) => void;
  onMarkRead: (id: string) => void;
}) => {
  const {
    bind,
    offset,
    isRevealed,
    showDeleteAction,
    shouldBlockClick,
    resetSwipeState,
  } = useSwipeableItem();
  const router = useRouter();

  const relativeDate = useMemo(
    () => formatRelativeDate(notification.createdAt),
    [notification.createdAt]
  );
  const isUnread = !notification.isRead;

  const handleNavigate = () => {
    if (shouldBlockClick()) {
      return;
    }

    if (isUnread) {
      onMarkRead(notification.id);
    }

    if (!notification.actionUrl) {
      return;
    }

    if (notification.actionUrl.startsWith("http")) {
      window.location.href = notification.actionUrl;
      return;
    }

    router.push(notification.actionUrl);
  };

  const handleDelete = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onDismiss(notification.id);
    resetSwipeState();

    try {
      await fetch(`/api/notifications/${notification.id}`, {
        method: "DELETE",
      });
    } catch (error) {
      console.error("알림 삭제에 실패했습니다.", error);
    }
  };

  return (
    <div className="relative overflow-hidden">
      <div
        className={cn(
          "absolute inset-y-0 right-0 flex w-20 items-center justify-center bg-destructive/80 text-destructive-foreground transition-opacity rounded-r-xl",
          showDeleteAction ? "opacity-100" : "pointer-events-none opacity-0"
        )}
      >
        <button
          type="button"
          aria-label="알림 삭제"
          className="flex size-10 items-center justify-center text-destructive-foreground"
          onClick={handleDelete}
        >
          <Trash2 className="size-5" color="white" />
        </button>
      </div>
      <div
        className="relative transition-transform duration-150 ease-out"
        style={{ transform: `translateX(${offset}px)` }}
        {...bind}
        onClick={handleNavigate}
      >
        <Item
          size="sm"
          className={cn("relative gap-3 border-0 p-0 bg-card/40")}
        >
          <ItemContent className="gap-1">
            <ItemHeader>
              <ItemTitle className="flex items-center gap-2">
                {isUnread ? (
                  <span
                    aria-hidden="true"
                    className="size-2.5 rounded-full bg-primary"
                  />
                ) : null}
                {notification.title}
              </ItemTitle>
            </ItemHeader>
            {notification.body ? (
              <ItemDescription>{notification.body}</ItemDescription>
            ) : null}
            <span className="mt-2 block text-right text-xs text-muted-foreground">
              {relativeDate}
            </span>
          </ItemContent>
        </Item>
      </div>
    </div>
  );
};

export const NotificationList = ({
  initialNotifications,
}: NotificationListProps) => {
  const [activeTab, setActiveTab] = useState<"unread" | "read">("unread");
  const [items, setItems] =
    useState<NotificationRecord[]>(initialNotifications);

  const handleDismiss = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const markAsRead = useCallback(async (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id && !item.isRead ? { ...item, isRead: true } : item
      )
    );

    try {
      await fetch(`/api/notifications/${id}/read`, {
        method: "POST",
      });
    } catch (error) {
      console.error("읽음 처리에 실패했습니다.", error);
    }
  }, []);

  const unreadItems = useMemo(
    () => items.filter((item) => !item.isRead),
    [items]
  );
  const readItems = useMemo(() => items.filter((item) => item.isRead), [items]);

  const unreadCount = unreadItems.length;
  const readCount = readItems.length;

  if (items.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-border/60 bg-muted/30 p-6 text-center text-sm text-muted-foreground">
        아직 새로운 알림이 없습니다.
      </div>
    );
  }

  const tabConfigs: {
    value: "unread" | "read";
    label: string;
    count: number;
  }[] = [
    { value: "unread", label: "안읽음", count: unreadCount },
    { value: "read", label: "읽음", count: readCount },
  ];

  return (
    <Tabs
      value={activeTab}
      onValueChange={(value) => setActiveTab(value as "unread" | "read")}
      className="space-y-4"
    >
      <TabsList className="w-fit gap-2 bg-muted/40 mx-auto">
        {tabConfigs.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            className="flex items-center gap-2 px-3 py-1.5 text-sm"
          >
            <span>{tab.label}</span>
            <Badge
              variant={activeTab === tab.value ? "secondary" : "outline"}
              className={cn(
                "tabular-nums h-5 min-w-5 rounded-full font-mono px-1",
                activeTab === tab.value
                  ? "border-transparent bg-primary/10 text-foreground"
                  : "border-border text-muted-foreground"
              )}
            >
              {tab.count}
            </Badge>
          </TabsTrigger>
        ))}
      </TabsList>

      {tabConfigs.map((tab) => (
        <TabsContent
          key={tab.value}
          value={tab.value}
          className="mt-0 space-y-3 px-6"
        >
          {(tab.value === "unread" ? unreadItems : readItems).length === 0 ? (
            <div className="rounded-xl border border-dashed border-border/60 bg-muted/30 text-center text-sm text-muted-foreground p-6">
              {tab.value === "unread"
                ? "읽지 않은 알림이 없습니다."
                : "읽은 알림이 없습니다."}
            </div>
          ) : (
            <ItemGroup className="space-y-3">
              {(tab.value === "unread" ? unreadItems : readItems).map(
                (notification) => (
                  <SwipeableNotificationItem
                    key={notification.id}
                    notification={notification}
                    onDismiss={handleDismiss}
                    onMarkRead={markAsRead}
                  />
                )
              )}
            </ItemGroup>
          )}
        </TabsContent>
      ))}
    </Tabs>
  );
};
