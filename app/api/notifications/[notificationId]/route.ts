import { NextResponse } from "next/server";

import { createServerSupabaseClient } from "@/config/supabase";

export async function DELETE(
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
      .delete()
      .eq("id", notificationId);

    if (error) {
      return NextResponse.json(
        { error: error.message ?? "알림을 삭제할 수 없습니다." },
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
            : "알림을 삭제하는 중 문제가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}
