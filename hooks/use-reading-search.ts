import { useEffect, useMemo, useState } from "react"

export interface ReadingSearchResultItem {
  id: string
  title: string
  description: string
}

export interface UseReadingSearchResult {
  query: string
  setQuery: (value: string) => void
  isSearching: boolean
  results: ReadingSearchResultItem[]
}

export const useReadingSearch = (): UseReadingSearchResult => {
  const [query, setQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [results, setResults] = useState<ReadingSearchResultItem[]>([])

  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      setIsSearching(false)
      return
    }

    setIsSearching(true)
    const handle = window.setTimeout(() => {
      // TODO: 실제 검색 API 연동
      setResults([
        {
          id: "sample-1",
          title: `"${query}"와 관련된 임시 결과`,
          description: "이 영역에 실제 검색 결과가 나타날 예정입니다.",
        },
      ])
      setIsSearching(false)
    }, 400)

    return () => {
      window.clearTimeout(handle)
    }
  }, [query])

  return {
    query,
    setQuery,
    isSearching,
    results,
  }
}
