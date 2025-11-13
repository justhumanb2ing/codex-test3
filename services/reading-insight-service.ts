import "server-only"

import { randomUUID } from "crypto"

const SUMMARY_MAX_LENGTH = 200
const DEFAULT_TOPIC_LIMIT = 5

const POSITIVE_KEYWORDS = [
  "감동",
  "좋다",
  "행복",
  "감사",
  "재미",
  "뿌듯",
  "위로",
  "희망",
]

const NEGATIVE_KEYWORDS = [
  "슬프",
  "지루",
  "실망",
  "화가",
  "짜증",
  "불안",
  "우울",
  "어렵",
]

const STOP_WORDS = new Set([
  "그리고",
  "그래서",
  "그러나",
  "하지만",
  "그리고",
  "무엇",
  "어떤",
  "그",
  "이",
  "저",
  "것",
  "에서",
  "하다",
  "했다",
  "나는",
  "우리는",
  "당신은",
])

export interface ReadingEmotion {
  id: string
  label: string
  score: number
  context?: string
}

export interface ReadingTopic {
  id: string
  value: string
  category?: string
  weight: number
}

export interface ReadingInsightResult {
  summary: string
  emotions: ReadingEmotion[]
  topics: ReadingTopic[]
}

export interface ReadingInsightOptions {
  topicLimit?: number
}

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value))

const normalizeWhitespace = (text: string) => text.replace(/\s+/g, " ").trim()

const buildSummary = (content: string): string => {
  const normalized = normalizeWhitespace(content)
  if (normalized.length <= SUMMARY_MAX_LENGTH) {
    return normalized
  }
  return `${normalized.slice(0, SUMMARY_MAX_LENGTH - 1)}…`
}

const detectSentiment = (
  content: string,
  context: string,
): ReadingEmotion => {
  const lower = content.toLowerCase()
  let positiveMatches = 0
  let negativeMatches = 0

  POSITIVE_KEYWORDS.forEach((keyword) => {
    if (lower.includes(keyword)) {
      positiveMatches += 1
    }
  })

  NEGATIVE_KEYWORDS.forEach((keyword) => {
    if (lower.includes(keyword)) {
      negativeMatches += 1
    }
  })

  const totalMatches = positiveMatches + negativeMatches
  const balance = totalMatches
    ? (positiveMatches - negativeMatches) / totalMatches
    : 0
  const score = clamp(Number(((balance + 1) / 2).toFixed(2)), 0, 1)

  if (balance > 0.2) {
    return {
      id: randomUUID(),
      label: "긍정",
      score,
      context,
    }
  }

  if (balance < -0.2) {
    return {
      id: randomUUID(),
      label: "부정",
      score,
      context,
    }
  }

  return {
    id: randomUUID(),
    label: "중립",
    score,
    context,
  }
}

const extractCandidateWords = (content: string) => {
  const lower = content
    .toLowerCase()
    .replace(/[^a-z0-9가-힣\s]/g, " ")
  return lower
    .split(/\s+/)
    .map((word) => word.trim())
    .filter((word) => word.length > 1 && !STOP_WORDS.has(word))
}

const extractTopics = (
  content: string,
  limit: number,
): ReadingTopic[] => {
  const candidates = extractCandidateWords(content)

  if (candidates.length === 0) {
    return []
  }

  const frequency = new Map<string, number>()
  candidates.forEach((word) => {
    frequency.set(word, (frequency.get(word) ?? 0) + 1)
  })

  const sorted = [...frequency.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)

  const maxFrequency = sorted[0]?.[1] ?? 1

  return sorted.map(([value, count]) => ({
    id: randomUUID(),
    value,
    category: "theme",
    weight: clamp(Number((count / maxFrequency).toFixed(2)), 0, 1),
  }))
}

/**
 * 감상문을 요약하고 감정/주제 태그를 생성합니다.
 * 간단한 키워드 기반 휴리스틱을 사용하여 오프라인에서도 동작하도록 설계되었습니다.
 */
export const generateReadingInsight = async (
  content: string,
  options: ReadingInsightOptions = {},
): Promise<ReadingInsightResult> => {
  const sanitized = normalizeWhitespace(content)

  if (!sanitized) {
    return {
      summary: "",
      emotions: [],
      topics: [],
    }
  }

  const summary = buildSummary(sanitized)
  const emotion = detectSentiment(sanitized, summary)
  const topicLimit = clamp(options.topicLimit ?? DEFAULT_TOPIC_LIMIT, 1, 10)
  const topics = extractTopics(sanitized, topicLimit)

  return {
    summary,
    emotions: [emotion],
    topics,
  }
}
