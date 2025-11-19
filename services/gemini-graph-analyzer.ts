import type {
  EmotionInsight,
  GraphAnalyzer,
  GraphAnalyzerInput,
  GraphAnalyzerResult,
  TopicInsight,
} from "@/types/graph-analyzer"

const DEFAULT_MODEL = "gemini-2.5-flash"
const API_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models"

type FetchFn = typeof fetch

interface GeminiCandidatePart {
  text?: string
}

interface GeminiCandidateContent {
  parts?: GeminiCandidatePart[]
}

interface GeminiCandidate {
  content?: GeminiCandidateContent
}

interface GeminiGenerateContentResponse {
  candidates?: GeminiCandidate[]
}

const normalizeText = (value: string): string => value.trim()

const ensureNumber = (value: unknown): number | undefined => {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return undefined
  }
  return value
}

const ensureStringArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) {
    return []
  }
  return value
    .map((item) => (typeof item === "string" ? normalizeText(item) : ""))
    .filter((item): item is string => Boolean(item))
}

const ensureTopicInsights = (value: unknown): TopicInsight[] => {
  if (!Array.isArray(value)) {
    return []
  }
  return value
    .map((item) => {
      if (!item || typeof item !== "object") {
        return null
      }
      const candidate = item as { label?: unknown; relevance?: unknown }
      const label = typeof candidate.label === "string" ? normalizeText(candidate.label) : ""
      if (!label) {
        return null
      }
      const relevance = ensureNumber(candidate.relevance)
      return typeof relevance === "number" ? { label, relevance } : { label }
    })
    .filter((item): item is TopicInsight => Boolean(item))
}

const ensureEmotionInsights = (value: unknown): EmotionInsight[] => {
  if (!Array.isArray(value)) {
    return []
  }
  return value
    .map((item) => {
      if (!item || typeof item !== "object") {
        return null
      }
      const candidate = item as { label?: unknown; intensity?: unknown }
      const label = typeof candidate.label === "string" ? normalizeText(candidate.label) : ""
      if (!label) {
        return null
      }
      const intensity = ensureNumber(candidate.intensity)
      return typeof intensity === "number" ? { label, intensity } : { label }
    })
    .filter((item): item is EmotionInsight => Boolean(item))
}

const buildPrompt = (input: GraphAnalyzerInput): string => {
  const keywordText =
    input.userKeywords.length > 0
      ? input.userKeywords.map((keyword) => `- ${keyword}`).join("\n")
      : "(사용자 지정 키워드 없음)"

  return [
    "당신은 독서 감상 데이터를 그래프 노드로 변환하기 위한 분석가입니다.",
    "다음 JSON 스키마에 맞춰 결과만 순수 JSON으로 응답하세요.",
    `{
  "aiSummary": string,
  "topics": [{ "label": string, "relevance": number }],
  "emotions": [{ "label": string, "intensity": number }],
  "authors": string[],
  "genres": string[],
  "keywords": string[]
}`,
    "입력 데이터:",
    `책 제목: ${input.bookTitle}`,
    `감상문: ${input.content}`,
    `사용자 키워드:\n${keywordText}`,
  ].join("\n\n")
}

const extractResponseText = (payload: GeminiGenerateContentResponse): string => {
  const candidate = payload.candidates?.find((item) => item.content?.parts?.length)
  const text = candidate?.content?.parts?.find((part) => typeof part.text === "string")?.text
  if (!text) {
    throw new Error("Gemini 응답에서 텍스트를 찾을 수 없습니다.")
  }
  return text
}

const parseGeminiResult = (text: string): GraphAnalyzerResult => {
  try {
    const raw = JSON.parse(text) as Partial<GraphAnalyzerResult>
    return {
      aiSummary: typeof raw.aiSummary === "string" ? normalizeText(raw.aiSummary) : null,
      topics: ensureTopicInsights(raw.topics),
      emotions: ensureEmotionInsights(raw.emotions),
      authors: ensureStringArray(raw.authors),
      genres: ensureStringArray(raw.genres),
      keywords: ensureStringArray(raw.keywords),
    }
  } catch (error) {
    throw new Error("Gemini 응답을 파싱할 수 없습니다.")
  }
}

export interface GeminiGraphAnalyzerOptions {
  apiKey: string
  model?: string
  temperature?: number
  topK?: number
  topP?: number
  fetchFn?: FetchFn
}

/**
 * Gemini 2.5 Flash 모델을 호출해 감상문 분석을 수행하는 GraphAnalyzer 구현체를 생성합니다.
 */
export const createGeminiGraphAnalyzer = (
  options: GeminiGraphAnalyzerOptions,
): GraphAnalyzer => {
  const model = options.model ?? DEFAULT_MODEL
  const fetchImpl: FetchFn = options.fetchFn ?? fetch

  const generateRequest = async (
    input: GraphAnalyzerInput,
  ): Promise<GraphAnalyzerResult> => {
    const prompt = buildPrompt(input)
    const url = new URL(`${API_BASE_URL}/${model}:generateContent`)
    url.searchParams.set("key", options.apiKey)

    const response = await fetchImpl(url.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: options.temperature ?? 0.35,
          topK: options.topK ?? 32,
          topP: options.topP ?? 0.95,
          responseMimeType: "application/json",
        },
      }),
    })

    if (!response.ok) {
      const message = `Gemini API 요청 실패 (${response.status})`
      throw new Error(message)
    }

    const payload = (await response.json()) as GeminiGenerateContentResponse
    const textResult = extractResponseText(payload)
    return parseGeminiResult(textResult)
  }

  return {
    async analyze(input: GraphAnalyzerInput): Promise<GraphAnalyzerResult> {
      return generateRequest(input)
    },
  }
}
