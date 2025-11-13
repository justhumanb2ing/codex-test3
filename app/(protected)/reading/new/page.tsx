import { ReadingEntryForm } from "@/components/reading/reading-entry-form"

export default function NewReadingEntryPage() {
  return (
    <section className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold text-foreground">독서 기록 작성</h1>
        <p className="text-sm text-muted-foreground">
          책을 읽고 느낀 점을 자유롭게 적어주세요. AI가 요약과 감정 태그를 도와드립니다.
        </p>
      </header>
      <ReadingEntryForm />
    </section>
  )
}
