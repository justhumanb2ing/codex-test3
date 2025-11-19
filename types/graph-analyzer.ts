export interface GraphAnalyzerInput {
  content: string
  bookTitle: string
  userKeywords: string[]
}

export interface TopicInsight {
  label: string
  relevance?: number
}

export interface EmotionInsight {
  label: string
  intensity?: number
}

export interface GraphAnalyzerResult {
  aiSummary?: string | null
  topics: TopicInsight[]
  emotions: EmotionInsight[]
  authors: string[]
  genres: string[]
  keywords: string[]
}

export interface GraphAnalyzer {
  analyze: (input: GraphAnalyzerInput) => Promise<GraphAnalyzerResult>
}
