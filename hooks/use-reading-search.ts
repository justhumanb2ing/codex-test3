import { useEffect, useRef, useState } from "react"

export interface ReadingSearchResultItem {
  id: string
  title: string
  authors: string[]
  publisher?: string
  thumbnail?: string
  url?: string
}

export interface UseReadingSearchResult {
  query: string
  setQuery: (value: string) => void
  isSearching: boolean
  results: ReadingSearchResultItem[]
  error?: string
}

export const useReadingSearch = (): UseReadingSearchResult => {
  const [query, setQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [results, setResults] = useState<ReadingSearchResultItem[]>([])
  const [error, setError] = useState<string | undefined>(undefined)
  const controllerRef = useRef<AbortController | null>(null)

  useEffect(() => {
    if (!query.trim()) {
      controllerRef.current?.abort()
      setResults([])
      setIsSearching(false)
      setError(undefined)
      return
    }

    setIsSearching(true)
    setError(undefined)

    const handle = window.setTimeout(async () => {
      controllerRef.current?.abort()
      const controller = new AbortController()
      controllerRef.current = controller

      try {
        const response = await fetch(
          `/api/search/books?query=${encodeURIComponent(query.trim())}`,
          { signal: controller.signal },
        )

        if (!response.ok) {
          throw new Error("검색 요청에 실패했습니다.")
        }

        const data = await response.json()
        setResults(data.results ?? [])
      } catch (err) {
        if ((err as DOMException).name === "AbortError") {
          return
        }
        setError(
          err instanceof Error
            ? err.message
            : "검색 중 문제가 발생했습니다.",
        )
        setResults([])
      } finally {
        setIsSearching(false)
      }
    }, 400)

    return () => {
      window.clearTimeout(handle)
      controllerRef.current?.abort()
    }
  }, [query])

  return {
    query,
    setQuery,
    isSearching,
    results,
    error,
  }
}
