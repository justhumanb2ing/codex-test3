import type { ReadingEmotion, ReadingTopic } from "@/services/reading-insight-service"

interface ReadingEntrySummaryProps {
  summary: string
  emotions: ReadingEmotion[]
  topics: ReadingTopic[]
}

const formatScore = (score: number) => `${Math.round(score * 100)}%`

export const ReadingEntrySummary = ({
  summary,
  emotions,
  topics,
}: ReadingEntrySummaryProps) => (
  <section className="space-y-6">
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-foreground">요약</h2>
      <p className="rounded-lg border border-border/60 bg-muted/40 p-4 text-sm leading-relaxed text-muted-foreground">
        {summary}
      </p>
    </div>
    <div className="space-y-3">
      <h3 className="text-base font-semibold text-foreground">감정 키워드</h3>
      {emotions.length === 0 ? (
        <p className="text-sm text-muted-foreground">감정 분석 결과가 없습니다.</p>
      ) : (
        <ul className="flex flex-wrap gap-3">
          {emotions.map((emotion) => (
            <li
              key={emotion.id}
              className="rounded-full border border-primary/40 bg-primary/10 px-4 py-2 text-sm text-primary"
            >
              <span className="font-semibold">{emotion.label}</span>
              <span className="ml-2 text-xs text-primary/80">
                {formatScore(emotion.score)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
    <div className="space-y-3">
      <h3 className="text-base font-semibold text-foreground">주제 태그</h3>
      {topics.length === 0 ? (
        <p className="text-sm text-muted-foreground">주제 태그가 없습니다.</p>
      ) : (
        <ul className="flex flex-wrap gap-2">
          {topics.map((topic) => (
            <li
              key={topic.id}
              className="rounded-md border border-border/70 bg-muted/30 px-3 py-1 text-xs font-medium uppercase tracking-wide text-muted-foreground"
            >
              {topic.value}
              <span className="ml-2 text-[10px] text-muted-foreground/70">
                {formatScore(topic.weight)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  </section>
)
