"use client";

import Link from "next/link";
import { SignOutButton } from "@clerk/nextjs";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ProfileInfo {
  email?: string;
  name?: string;
  userId?: string;
  avatarUrl?: string;
}

const getInitials = (profile: ProfileInfo) => {
  const source = profile.name ?? profile.email ?? "U";
  const [first = "", second = ""] = source.split(" ");
  const initials = `${first[0] ?? ""}${second[0] ?? ""}`.trim();
  if (initials) {
    return initials.toUpperCase();
  }
  return source.slice(0, 2).toUpperCase() || "U";
};

export const ProfileMenu = ({ profile }: { profile: ProfileInfo }) => {
  const profilePath = profile.userId
    ? `/profile/${encodeURIComponent(profile.userId)}`
    : "/profile";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-3 rounded-full  bg-background px-2 py-1 text-sm font-medium transition hover:bg-accent cursor-pointer"
        >
          <Avatar className="size-8">
            {profile.avatarUrl ? (
              <AvatarImage src={profile.avatarUrl} alt={profile.name ?? ""} />
            ) : null}
            <AvatarFallback>{getInitials(profile)}</AvatarFallback>
          </Avatar>
          <span className="hidden text-left text-xs text-muted-foreground sm:block">
            {profile.name ?? profile.email}
          </span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel className="flex flex-col gap-0.5">
          <span className="text-sm font-medium">
            {profile.name ?? "사용자"}
          </span>
          <span className="text-xs text-muted-foreground">{profile.email}</span>
        </DropdownMenuLabel>
        <DropdownMenuItem asChild>
          <Link href={profilePath} className="w-full cursor-pointer text-sm">
            프로필 설정
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <SignOutButton signOutOptions={{ redirectUrl: "/" }}>
          <DropdownMenuItem className="w-full cursor-pointer text-sm text-destructive">
            로그아웃
          </DropdownMenuItem>
        </SignOutButton>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
