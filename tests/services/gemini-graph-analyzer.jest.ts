import { createGeminiGraphAnalyzer } from "@/services/gemini-graph-analyzer"

const buildFetchResponse = (payload: unknown) =>
  Promise.resolve({
    ok: true,
    json: async () => payload,
  }) as unknown as ReturnType<typeof fetch>

describe("gemini-graph-analyzer", () => {
  const input = {
    content: "감상문", 
    bookTitle: "데미안",
    userKeywords: ["자아"],
  }

  it("Gemini API 응답을 파싱해 GraphAnalyzerResult를 반환한다", async () => {
    const payload = {
      candidates: [
        {
          content: {
            parts: [
              {
                text: JSON.stringify({
                  aiSummary: "요약",
                  topics: [{ label: "성장", relevance: 0.8 }],
                  emotions: [{ label: "희망", intensity: 0.9 }],
                  authors: ["헤르만 헤세"],
                  genres: ["성장소설"],
                  keywords: ["자기 발견"],
                }),
              },
            ],
          },
        },
      ],
    }

    const fetchMock = jest.fn().mockReturnValue(buildFetchResponse(payload))
    const analyzer = createGeminiGraphAnalyzer({ apiKey: "test", fetchFn: fetchMock as never })

    const result = await analyzer.analyze(input)

    expect(result.topics[0]).toEqual({ label: "성장", relevance: 0.8 })
    expect(result.authors).toEqual(["헤르만 헤세"])
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("gemini-2.5-flash:generateContent"),
      expect.objectContaining({ method: "POST" }),
    )
  })

  it("잘못된 JSON 응답 시 에러를 던진다", async () => {
    const payload = {
      candidates: [
        {
          content: { parts: [{ text: "invalid-json" }] },
        },
      ],
    }

    const fetchMock = jest.fn().mockReturnValue(buildFetchResponse(payload))
    const analyzer = createGeminiGraphAnalyzer({ apiKey: "test", fetchFn: fetchMock as never })

    await expect(analyzer.analyze(input)).rejects.toThrow("Gemini 응답을 파싱할 수 없습니다.")
  })

  it("API 에러 상태 코드를 그대로 전달한다", async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: false,
      status: 429,
    })
    const analyzer = createGeminiGraphAnalyzer({ apiKey: "test", fetchFn: fetchMock as never })

    await expect(analyzer.analyze(input)).rejects.toThrow("Gemini API 요청 실패 (429)")
  })
})
