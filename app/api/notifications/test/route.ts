import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/config/supabase";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const title = typeof body.title === "string" ? body.title.trim() : "";
    const content =
      typeof body.body === "string" ? body.body.trim() : undefined;
    const actionUrl =
      typeof body.actionUrl === "string" ? body.actionUrl.trim() : undefined;
    const userId =
      typeof body.userId === "string" ? body.userId.trim() || null : null;

    if (!title) {
      return NextResponse.json(
        { error: "제목을 입력해주세요." },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.from("notifications").insert({
      title,
      body: content,
      action_url: actionUrl,
      user_id: userId,
    });

    if (error) {
      return NextResponse.json(
        {
          error: error.message ?? "알림을 저장하지 못했습니다.",
        },
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
            : "알림을 생성하는 중 문제가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}
