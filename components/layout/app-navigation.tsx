"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BellSimpleIcon } from "@phosphor-icons/react/dist/csr/BellSimple";
import { HouseIcon } from "@phosphor-icons/react/dist/csr/House";
import { MagnifyingGlassIcon } from "@phosphor-icons/react/dist/csr/MagnifyingGlass";
import { PlusIcon } from "@phosphor-icons/react/dist/csr/Plus";
import { UserIcon } from "@phosphor-icons/react/dist/csr/User";
import type { Icon as IconType } from "@phosphor-icons/react";

import { Button } from "@/components/ui/button";
import { ReadingEntryModal } from "@/components/reading/reading-entry-modal";
import { cn } from "@/lib/utils";
import { NavigationDropdown } from "@/components/layout/navigation-dropdown";
import { AppLogo } from "./app-logo";

interface AppNavigationProps {
  profile?: {
    email?: string;
    userId?: string;
    name?: string;
  } | null;
  variant?: "vertical" | "horizontal";
}

interface NavItem {
  href?: string;
  label: string;
  icon: IconType;
  isActive: (pathname: string) => boolean;
  fillOnActive?: boolean;
  useModal?: boolean;
}

export const AppNavigation = ({
  profile,
  variant = "vertical",
}: AppNavigationProps) => {
  const pathname = usePathname();
  const hasProfile = Boolean(profile?.userId);
  const profileHref = hasProfile ? `/profile/${profile?.userId}` : "/sign-in";
  const notificationsHref = hasProfile
    ? `/notifications/${profile?.userId}`
    : "/sign-in";
  const currentUserName = profile?.name ?? "사용자";

  const items: NavItem[] = [
    {
      href: "/",
      label: "홈",
      icon: HouseIcon,
      isActive: (path) => path === "/",
    },
    {
      href: "/search",
      label: "검색",
      icon: MagnifyingGlassIcon,
      isActive: (path) => path.startsWith("/search"),
      fillOnActive: false,
    },
    {
      href: "/reading?compose=new",
      label: "독서 기록 생성",
      icon: PlusIcon,
      isActive: (path) => path.startsWith("/reading"),
      fillOnActive: false,
      useModal: true,
    },
    {
      href: notificationsHref,
      label: "알림",
      icon: BellSimpleIcon,
      isActive: (path) => path.startsWith("/notifications"),
    },
    {
      href: profileHref,
      label: "프로필",
      icon: UserIcon,
      isActive: (path) =>
        hasProfile ? path.startsWith("/profile") : path.startsWith("/sign-in"),
    },
  ];

  const isVertical = variant === "vertical";

  return (
    <nav
      className={cn(
        "flex py-1",
        isVertical
          ? "h-full flex-col items-center justify-between"
          : "w-full flex-col items-stretch justify-between gap-3"
      )}
      aria-label="주요 내비게이션"
    >
      {isVertical ? <AppLogo /> : null}
      <div
        className={cn(
          "flex",
          isVertical
            ? "flex-col items-center gap-4"
            : "w-full flex-row items-center justify-between gap-0"
        )}
      >
        {items.map((item) => {
          const Icon = item.icon;
          const active = item.isActive(pathname);
          const isModalTrigger = Boolean(item.useModal);
          const iconWeight = active
            ? item.fillOnActive === false
              ? "bold"
              : "fill"
            : "bold";

          if (isModalTrigger) {
            return (
              <ReadingEntryModal
                key={item.label}
                redirectOnClose={null}
                currentUserName={currentUserName}
                trigger={
                  <Button
                    type="button"
                    variant="ghost"
                    size={isVertical ? "icon-lg" : "icon"}
                    className={cn(
                      "rounded-2xl bg-transparent p-0 text-stone-400 transition-colors",
                      "hover:bg-muted/70 hover:text-foreground",
                      active && "bg-muted text-primary hover:bg-muted",
                      isVertical ? "h-12 w-12" : "h-12 w-12 flex-1"
                    )}
                  >
                    <Icon
                      size={isVertical ? 24 : 24}
                      weight={iconWeight}
                      className="size-6"
                    />
                  </Button>
                }
              />
            );
          }

          return (
            <Button
              key={item.label}
              asChild
              variant="ghost"
              size={isVertical ? "icon-lg" : "icon"}
              className={cn(
                "rounded-2xl bg-transparent p-0 text-stone-400 transition-colors",
                "hover:bg-muted/70 hover:text-foreground ",
                active && "bg-muted text-primary hover:bg-muted",
                isVertical ? "h-12 w-12" : "h-12 w-12 flex-1"
              )}
            >
              <Link href={item.href!} aria-label={item.label}>
                <Icon
                  size={isVertical ? 24 : 24}
                  weight={iconWeight}
                  className="size-6"
                />
              </Link>
            </Button>
          );
        })}
      </div>
      {isVertical ? (
        <div className="flex items-center">
          <NavigationDropdown align="start" />
        </div>
      ) : null}
    </nav>
  );
};
