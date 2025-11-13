"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { signOutAction } from "@/app/(auth)/actions";

interface ProfileInfo {
  email?: string;
  name?: string;
  avatarUrl?: string;
}

const getInitials = (profile: ProfileInfo) => {
  if (profile.name) {
    const [first = "", second = ""] = profile.name.split(" ");
    return (first[0] ?? "") + (second[0] ?? "");
  }
  if (profile.email) {
    return profile.email.slice(0, 2).toUpperCase();
  }
  return "U";
};

export const ProfileMenu = ({ profile }: { profile: ProfileInfo }) => {
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
        <DropdownMenuSeparator />
        <form action={signOutAction}>
          <DropdownMenuItem asChild>
            <button
              type="submit"
              className="w-full text-left text-sm text-destructive cursor-pointer"
            >
              로그아웃
            </button>
          </DropdownMenuItem>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
