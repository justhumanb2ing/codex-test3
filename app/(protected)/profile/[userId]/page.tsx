import Link from "next/link";
import { notFound } from "next/navigation";
import { Sparkles } from "lucide-react";
import Image from "next/image";

import { ProfileEditModal } from "@/components/profile/profile-edit-modal";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReadingEntryList } from "@/components/reading/reading-entry-list";
import { getCurrentUser } from "@/services/auth-service";
import { listReadingEntries } from "@/services/reading-log-service";
import { buildProfileName } from "@/lib/profile-utils";

const buildAvatarUrl = (metadata: Record<string, unknown>) => {
  const candidates = ["custom_avatar_url", "avatar_url", "picture"];
  for (const field of candidates) {
    const value = metadata?.[field];
    if (typeof value === "string" && value.trim().length > 0) {
      return value;
    }
  }
  return undefined;
};

const buildInitials = (name: string) => {
  const [first = "", second = ""] = name.split(" ");
  const initials = `${first[0] ?? ""}${second[0] ?? ""}`.trim();
  if (initials) {
    return initials.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase() || "US";
};

interface ProfileSettingsPageProps {
  params: Promise<{
    userId: string | undefined;
  }>;
}

export default async function ProfileSettingsPage({
  params,
}: ProfileSettingsPageProps) {
  const { userId } = await params;

  if (!userId) {
    notFound();
  }

  const [currentUser, readingsResult] = await Promise.all([
    getCurrentUser(),
    listReadingEntries(userId),
  ]);

  if (!currentUser || currentUser.id !== userId) {
    notFound();
  }

  const entries =
    readingsResult.success && readingsResult.data ? readingsResult.data : [];
  const historyCount = entries.length;
  const hasEnoughHistory = historyCount > 5;

  const metadata = (currentUser.user_metadata ?? {}) as Record<string, unknown>;
  const firstName =
    currentUser.firstName ?? (metadata?.name as string | undefined) ?? "";
  const lastName =
    currentUser.lastName ?? (metadata?.nickname as string | undefined) ?? "";
  const profileName =
    [lastName, firstName].filter((part) => part?.length).join("") ||
    buildProfileName(metadata, currentUser.email ?? undefined);
  const avatarUrl = buildAvatarUrl(metadata);
  const initials = buildInitials(profileName);
  const email = currentUser.email ?? "이메일 정보가 없습니다.";

  return (
    <main className="space-y-10">
      <section className="space-y-6">
        <div className="flex flex-col gap-6">
          <div className="flex items-center flex-row-reverse justify-between w-full">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt={`${profileName} 프로필 이미지`}
                className="size-24 rounded-full border border-border object-cover"
                width={84}
                height={84}
              />
            ) : (
              <div className="flex size-20 items-center justify-center rounded-full border border-border/70 bg-muted/50 text-lg font-semibold text-muted-foreground">
                {initials}
              </div>
            )}
            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-foreground">
                {profileName}
              </h1>
              <p className="text-sm text-muted-foreground">{email}</p>
            </div>
          </div>
          <div>
            <ProfileEditModal
              defaultFirstName={firstName}
              defaultLastName={lastName}
              defaultAvatarUrl={avatarUrl}
            />
          </div>
        </div>
      </section>
      <Tabs defaultValue="records" className="rounded-xl bg-card/20">
        <TabsList className="flex flex-wrap gap-2 bg-transparent p-0">
          <TabsTrigger value="records">독서 기록</TabsTrigger>
          <TabsTrigger value="timeline">독서 히스토리 시각화</TabsTrigger>
          <TabsTrigger value="achievements">업적 및 배지</TabsTrigger>
          <TabsTrigger value="insights">사용자 분석</TabsTrigger>
        </TabsList>
        <TabsContent value="records" className="mt-6">
          {entries.length === 0 ? (
            <Empty className="rounded-2xl border border-dashed border-border/60 bg-muted/20">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Sparkles className="size-5 text-primary" />
                </EmptyMedia>
                <EmptyTitle>작성된 독서 기록이 없습니다.</EmptyTitle>
                <EmptyDescription>
                  첫 독서 기록을 남겨보면 히스토리를 시작할 수 있어요.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button asChild className="w-full md:w-64">
                  <Link href="/reading/new">독서 기록 작성하기</Link>
                </Button>
              </EmptyContent>
            </Empty>
          ) : (
            <ReadingEntryList entries={entries} />
          )}
        </TabsContent>
        <TabsContent value="timeline" className="mt-6">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Timeline
              </p>
              <h2 className="text-xl font-semibold text-foreground">
                독서 히스토리 시각화
              </h2>
            </div>
          </div>
          {historyCount === 0 ? (
            <Empty
              data-testid="history-empty"
              className="mt-6 rounded-2xl border border-dashed border-border/60 bg-muted/20"
            >
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Sparkles className="size-5 text-primary" />
                </EmptyMedia>
                <EmptyTitle>아직 기록이 없어요</EmptyTitle>
                <EmptyDescription>
                  첫 독서 히스토리를 작성하면 시각화 리포트를 만들어드릴게요.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button asChild className="w-full md:w-64">
                  <Link href="/reading/new">독서 히스토리 작성하기</Link>
                </Button>
              </EmptyContent>
            </Empty>
          ) : (
            <div className="mt-6 space-y-2 text-sm text-muted-foreground">
              <p>
                최근 {historyCount}개의 독서 기록을 기반으로 트렌드를 분석할 수
                있어요. 시각화 기능은 곧 제공될 예정입니다.
              </p>
            </div>
          )}
        </TabsContent>
        <TabsContent value="achievements" className="mt-6">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Achievements
              </p>
              <h2 className="text-xl font-semibold text-foreground">
                업적 및 배지
              </h2>
            </div>
          </div>
          <div className="mt-6 rounded-2xl border border-dashed border-border/60 bg-muted/20 p-6 text-sm text-muted-foreground">
            새로운 업적을 준비 중입니다. 조금만 기다려주세요!
          </div>
        </TabsContent>
        <TabsContent value="insights" className="mt-6">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Insights
              </p>
              <h2 className="text-xl font-semibold text-foreground">
                사용자 분석
              </h2>
            </div>
          </div>
          {!hasEnoughHistory ? (
            <Empty
              data-testid="analysis-empty"
              className="mt-6 rounded-2xl border border-dashed border-border/60 bg-muted/20"
            >
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Sparkles className="size-5 text-primary" />
                </EmptyMedia>
                <EmptyTitle>조금만 더 기록해볼까요?</EmptyTitle>
                <EmptyDescription>
                  히스토리를 5개 적으면 사용자 분석을 할 수 있어요
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button disabled className="w-full md:w-64">
                  사용자 분석
                </Button>
              </EmptyContent>
            </Empty>
          ) : null}
        </TabsContent>
      </Tabs>
    </main>
  );
}
