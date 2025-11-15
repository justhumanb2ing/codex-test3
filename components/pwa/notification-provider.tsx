"use client";

import { useEffect, useState } from "react";

import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

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

  useEffect(() => {
    requestPermission().then(setPermission).catch(console.error);
  }, []);

  useEffect(() => {
    if (permission === "denied") {
      return;
    }

    const supabase = getSupabaseBrowserClient();
    const channel = supabase
      .channel("notifications-feed")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
        },
        (payload) => {
          const record = payload.new as NotificationRow;
          showNativeNotification(record);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [permission]);

  return null;
};
