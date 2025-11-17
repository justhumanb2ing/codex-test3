"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

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
import type { ReadingEntry } from "@/services/reading-log-service";
import { cn } from "@/lib/utils";

type ProfileTabValue = "records" | "timeline" | "achievements" | "insights";

const TAB_ITEMS: ReadonlyArray<{
  value: ProfileTabValue;
  label: string;
}> = [
  { value: "records", label: "독서 기록" },
  { value: "timeline", label: "독서 히스토리 시각화" },
  { value: "achievements", label: "업적 및 배지" },
  { value: "insights", label: "사용자 분석" },
];

interface ProfileTabsProps {
  entries: ReadingEntry[];
  historyCount: number;
  hasEnoughHistory: boolean;
}

export const ProfileTabs = ({
  entries,
  historyCount,
  hasEnoughHistory,
}: ProfileTabsProps) => {
  const [activeTab, setActiveTab] = useState<ProfileTabValue>("records");
  const [indicatorStyle, setIndicatorStyle] = useState({
    width: 0,
    left: 0,
  });
  const listRef = useRef<HTMLDivElement | null>(null);
  const triggerRefs = useRef<
    Partial<Record<ProfileTabValue, HTMLButtonElement | null>>
  >({});

  const updateIndicator = useCallback((value: ProfileTabValue) => {
    const trigger = triggerRefs.current[value];
    const list = listRef.current;
    if (!trigger || !list) {
      return;
    }

    const triggerRect = trigger.getBoundingClientRect();
    const listRect = list.getBoundingClientRect();

    setIndicatorStyle({
      width: triggerRect.width,
      left: triggerRect.left - listRect.left + list.scrollLeft,
    });
  }, []);

  useEffect(() => {
    const frame = requestAnimationFrame(() => updateIndicator(activeTab));
    return () => cancelAnimationFrame(frame);
  }, [activeTab, updateIndicator]);

  useEffect(() => {
    const handleResize = () => updateIndicator(activeTab);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [activeTab, updateIndicator]);

  return (
    <Tabs
      value={activeTab}
      onValueChange={(value) => setActiveTab(value as ProfileTabValue)}
    >
      <TabsList
        ref={listRef}
        className="relative flex flex-wrap gap-4 rounded-none border-b border-border/50 bg-transparent p-0 w-full mt-6"
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 h-[2px] rounded-full bg-foreground transition-[left,width] duration-300 ease-out"
          style={{
            width: indicatorStyle.width,
            left: indicatorStyle.left,
          }}
        />
        {TAB_ITEMS.map(({ value, label }) => (
          <TabsTrigger
            key={value}
            value={value}
            ref={(node) => {
              triggerRefs.current[value] = node;
            }}
            className={cn(
              "relative rounded-none border-none border-b-2 border-transparent px-1 pb-6",
              "text-base font-medium text-muted-foreground transition-colors duration-200",
              "data-[state=active]:text-foreground data-[state=active]:shadow-none data-[state=active]:bg-transparent"
            )}
          >
            {label}
          </TabsTrigger>
        ))}
      </TabsList>
      <TabsContent value="records" className="p-6">
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
      <TabsContent value="timeline" className="p-6">
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
      <TabsContent value="achievements" className="p-6">
        <div className="mt-6 rounded-2xl border border-dashed border-border/60 bg-muted/20 p-6 text-sm text-muted-foreground">
          새로운 업적을 준비 중입니다. 조금만 기다려주세요!
        </div>
      </TabsContent>
      <TabsContent value="insights" className="p-6">
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
  );
};
