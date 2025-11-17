"use client";

import { SignOutButton } from "@clerk/nextjs";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { FadersHorizontalIcon } from "@phosphor-icons/react/dist/csr/FadersHorizontal";

interface NavigationDropdownProps {
  align?: "start" | "center" | "end";
  className?: string;
}

export const NavigationDropdown = ({
  align = "end",
  className,
}: NavigationDropdownProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="사용자 메뉴 열기"
          className={cn(
            "h-12 w-12 rounded-2xl bg-transparent p-0 text-muted-foreground transition-colors",
            "hover:bg-muted/70 hover:text-foreground",
            className
          )}
        >
          <FadersHorizontalIcon size={24} weight="bold" className="size-6" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className="w-48">
        <SignOutButton signOutOptions={{ redirectUrl: "/" }}>
          <DropdownMenuItem className="cursor-pointer text-destructive">
            로그아웃
          </DropdownMenuItem>
        </SignOutButton>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
