"use client";

import { useEffect, useState } from "react";

import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

export const NotificationPermissionToggle = () => {
  const [permission, setPermission] = useState<NotificationPermission | null>(
    null
  );
  const enabled = permission === "granted";

  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      setPermission("denied");
      return;
    }
    setPermission(Notification.permission);
  }, []);

  const handleChange = async (checked: boolean) => {
    if (checked) {
      try {
        const result = await Notification.requestPermission();
        setPermission(result);
      } catch (error) {
        console.error(error);
      }
      return;
    }

    alert("알림 권한 해제는 브라우저 설정에서 직접 변경해야 합니다.");
  };

  return (
    <div className="rounded-3xl border border-border/60 bg-card/40 p-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium">알림 권한</p>
          <p className="text-xs text-muted-foreground">
            브라우저에서 알림을 허용해야 실시간 알림을 받을 수 있습니다.
          </p>
        </div>
        <Switch
          checked={enabled}
          onCheckedChange={handleChange}
          disabled={permission === null}
        />
      </div>
      {permission === "denied" ? (
        <p className={cn("mt-3 text-xs text-destructive")}>
          현재 알림이 차단되어 있습니다. 브라우저 설정에서 해당 사이트의 알림을
          허용해주세요.
        </p>
      ) : null}
    </div>
  );
};
