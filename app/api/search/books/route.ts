/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server"

const cache = new Map<
  string,
  {
    timestamp: number
    payload: unknown
  }
>()

const CACHE_TTL = 1000 * 60 * 5 // 5 minutes

const getEnv = (key: string, message: string) => {
  const value = process.env[key]
  if (!value) {
    throw new Error(message)
  }
  return value
}

const fetchBooks = async (query: string) => {
  const KAKAO_REST_API_KEY = getEnv(
    "KAKAO_REST_API_KEY",
    "KAKAO_REST_API_KEY 환경 변수가 설정되지 않았습니다.",
  )
  const endpoint = new URL("https://dapi.kakao.com/v3/search/book")
  endpoint.searchParams.set("query", query)
  endpoint.searchParams.set("size", "5")
  endpoint.searchParams.set("target", "title")

  const response = await fetch(endpoint, {
    headers: {
      Authorization: `KakaoAK ${KAKAO_REST_API_KEY}`,
    },
    cache: "no-store",
  })

  if (!response.ok) {
    throw new Error("카카오 도서 검색 API 호출에 실패했습니다.")
  }

  const data = await response.json()
  const results =
    data?.documents?.map((doc: any, index: number) => ({
      id: doc.isbn || `${doc.title}-${index}`,
      title: doc.title,
      authors: doc.authors,
      publisher: doc.publisher,
      thumbnail: doc.thumbnail,
      url: doc.url,
    })) ?? []

  return { results }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const rawQuery = searchParams.get("query")?.trim() ?? ""

  if (rawQuery.length < 2) {
    return NextResponse.json({ results: [] })
  }

  const normalizedQuery = rawQuery.toLowerCase()
  const cached = cache.get(normalizedQuery)

  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return NextResponse.json(cached.payload)
  }

  try {
    const payload = await fetchBooks(rawQuery)
    cache.set(normalizedQuery, { timestamp: Date.now(), payload })
    return NextResponse.json(payload)
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { results: [], error: "검색 중 문제가 발생했습니다." },
      { status: 500 },
    )
  }
}
