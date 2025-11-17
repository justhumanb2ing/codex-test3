"use client";

import { useEffect, useState } from "react";
import { useSession } from "@clerk/nextjs";
import type { RealtimeChannel } from "@supabase/supabase-js";

import { createBrowserSupabaseClient } from "@/lib/supabase-browser";

interface NotificationRow {
  id: string;
  title: string;
  body?: string | null;
  action_url?: string | null;
}

const requestPermission = async () => {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "denied" as NotificationPermission;
  }

  if (Notification.permission === "default") {
    return Notification.requestPermission();
  }

  return Notification.permission;
};

const showNativeNotification = async (payload: NotificationRow) => {
  if (typeof window === "undefined") return;

  const options: NotificationOptions = {
    body: payload.body ?? "",
    data: {
      actionUrl: payload.action_url,
    },
    icon: "/next.svg",
    tag: payload.id,
  };

  try {
    const registration = await navigator.serviceWorker?.ready;
    if (registration?.showNotification) {
      await registration.showNotification(payload.title, options);
      return;
    }
  } catch (error) {
    console.error("Notification via service worker failed", error);
  }

  if ("Notification" in window) {
    new Notification(payload.title, options);
  }

  if (navigator.serviceWorker?.controller) {
    navigator.serviceWorker.controller.postMessage({
      type: "SHOW_NOTIFICATION",
      payload: {
        title: payload.title,
        options,
      },
    });
  }
};

export const NotificationProvider = () => {
  const [permission, setPermission] = useState<NotificationPermission>(
    typeof window !== "undefined" ? Notification.permission : "default"
  );
  const [userId, setUserId] = useState<string | null>(null);
  const { session } = useSession();
  const client = createBrowserSupabaseClient(
    () => session?.getToken() ?? Promise.resolve(null)
  );

  console.log(session?.user)
  useEffect(() => {
    requestPermission().then(setPermission).catch(console.error);
  }, []);

  useEffect(() => {
    setUserId(session?.user?.id ?? null);
  }, [session]);

  useEffect(() => {
    if (permission === "denied") {
      return;
    }

    const channels: RealtimeChannel[] = [];

    const subscribe = (channelName: string, filter: string) =>
      client
        .channel(channelName)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "notifications",
            filter,
          },
          (payload) => {
            const record = payload.new as NotificationRow;
            showNativeNotification(record);
          }
        )
        .subscribe();

    channels.push(subscribe("notifications-global", "user_id=is.null"));

    if (userId) {
      channels.push(
        subscribe(`notifications-user-${userId}`, `user_id=eq.${userId}`)
      );
    }

    return () => {
      channels.forEach((channel) => client.removeChannel(channel));
    };
  }, [client, permission, userId]);

  return null;
};
