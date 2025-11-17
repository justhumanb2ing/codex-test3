
import { createServerSupabaseClient } from "@/config/supabase";

export interface NotificationRecord {
  id: string;
  title: string;
  body?: string | null;
  actionUrl?: string | null;
  createdAt: string;
  userId?: string | null;
  readAt?: string | null;
  isRead: boolean;
}

export interface NotificationListResult {
  success: boolean;
  data?: NotificationRecord[];
  error?: string;
}

export const listNotifications = async (
  userId: string
): Promise<NotificationListResult> => {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("notifications")
    .select()
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  const records =
    data?.map((row) => ({
      id: row.id as string,
      title: (row.title as string) ?? "",
      body: (row.body as string) ?? null,
      actionUrl: (row.action_url as string) ?? null,
      createdAt: row.created_at as string,
      userId: (row.user_id as string) ?? null,
      readAt: (row.read_at as string) ?? null,
      isRead: Boolean(row.is_read),
    })) ?? [];

  return {
    success: true,
    data: records,
  };
};
