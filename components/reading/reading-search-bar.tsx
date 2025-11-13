"use client";

import { Search } from "lucide-react"

import { Input } from "@/components/ui/input"
import { useReadingSearch } from "@/hooks/use-reading-search"

export const ReadingSearchBar = () => {
  const { query, setQuery, isSearching, results } = useReadingSearch()

  return (
    <div className="space-y-4">
      <div className="mx-auto w-full max-w-xl rounded-3xl border border-border/60 px-4 py-2 transition hover:border-border focus-within:border-foreground/70 focus-within:ring-2 focus-within:ring-primary/20 bg-secondary/60">
        <label className="flex items-center gap-3 text-sm text-muted-foreground">
          <Search className="size-4 shrink-0 text-muted-foreground" />
          <Input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="읽은 책이나 감상을 검색하세요"
            className="border-0 bg-transparent px-0 py-0 text-base focus-visible:ring-0 shadow-none"
          />
        </label>
      </div>
      {results.length > 0 ? (
        <div className="mx-auto w-full max-w-xl space-y-3 rounded-3xl border border-border/60 bg-card/60 p-4 shadow-sm">
          {results.map((result) => (
            <div
              key={result.id}
              className="rounded-2xl border border-border/50 bg-background/80 p-4"
            >
              <p className="text-sm font-semibold text-foreground">
                {result.title}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {result.description}
              </p>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}
