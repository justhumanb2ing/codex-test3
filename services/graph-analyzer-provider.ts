import { createGeminiGraphAnalyzer } from "@/services/gemini-graph-analyzer"
import type { GraphAnalyzer } from "@/types/graph-analyzer"

export interface GraphAnalyzerProvider {
  getAnalyzer: () => Promise<GraphAnalyzer>
}

export interface GeminiAnalyzerProviderOptions {
  apiKey?: string
  model?: string
  temperature?: number
  topK?: number
  topP?: number
}

const resolveApiKey = (explicitKey?: string): string => {
  const key = explicitKey ?? process.env.GEMINI_API_KEY
  if (!key) {
    throw new Error("Gemini API 키(GEMINI_API_KEY)가 설정되지 않았습니다.")
  }
  return key
}

/**
 * Gemini 2.5 Flash 모델을 기본으로 사용하는 GraphAnalyzerProvider를 생성합니다.
 */
export const createGeminiAnalyzerProvider = (
  options?: GeminiAnalyzerProviderOptions,
): GraphAnalyzerProvider => {
  let memoizedAnalyzer: Promise<GraphAnalyzer> | null = null

  return {
    getAnalyzer: async () => {
      if (!memoizedAnalyzer) {
        memoizedAnalyzer = Promise.resolve(
          createGeminiGraphAnalyzer({
            apiKey: resolveApiKey(options?.apiKey),
            model: options?.model,
            temperature: options?.temperature,
            topK: options?.topK,
            topP: options?.topP,
          }),
        )
      }
      return memoizedAnalyzer
    },
  }
}

/**
 * 이미 생성된 GraphAnalyzer를 그대로 노출하는 Provider를 생성합니다.
 */
export const createStaticAnalyzerProvider = (
  analyzer: GraphAnalyzer,
): GraphAnalyzerProvider => ({
  getAnalyzer: async () => analyzer,
})
