"use client"

import { Search } from "lucide-react"
import type { ReactNode } from "react"

import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export interface SearchBarProps<T> {
  query: string
  onQueryChange: (value: string) => void
  placeholder?: string
  isSearching?: boolean
  error?: string
  results: T[]
  renderResults?: (results: T[]) => ReactNode
}

export function SearchBar<T>({
  query,
  onQueryChange,
  placeholder = "검색어를 입력하세요",
  isSearching = false,
  error,
  results,
  renderResults,
}: SearchBarProps<T>) {
  const hasResults = results.length > 0

  return (
    <div className="">
      <div
        className={cn(
          "mx-auto w-full max-w-xl rounded-3xl bg-card/80 px-4 py-2 shadow-sm transition focus-within:ring-2 focus-within:ring-primary/20",
          hasResults && "rounded-b-none",
        )}
      >
        <label className="flex items-center gap-3 text-sm text-muted-foreground">
          <Search className="size-4 shrink-0 text-muted-foreground" />
          <Input
            type="search"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder={placeholder}
            className="border-0 bg-transparent px-0 py-0 text-base focus-visible:ring-0 shadow-none"
          />
        </label>
      </div>
      {error ? (
        <p className="mx-auto max-w-xl rounded-3xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      ) : null}
      {hasResults && renderResults ? (
        <div className="mx-auto w-full max-w-xl rounded-b-3xl rounded-t-none bg-card/60 p-3 shadow-sm">
          {renderResults(results)}
        </div>
      ) : null}
    </div>
  )
}
