import { NextResponse } from "next/server";

import { createServerSupabaseClient } from "@/config/supabase";

export async function POST(
  _request: Request,
  {
    params,
  }: {
    params: Promise<{ notificationId?: string }>;
  }
) {
  const { notificationId } = await params;

  if (!notificationId) {
    return NextResponse.json(
      { error: "알림 ID가 필요합니다." },
      { status: 400 }
    );
  }

  try {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase
      .from("notifications")
      .update({
        read_at: new Date().toISOString(),
        is_read: true,
      })
      .eq("id", notificationId);

    if (error) {
      return NextResponse.json(
        { error: error.message ?? "알림 읽음 상태를 업데이트할 수 없습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "알림 읽음 처리 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}
