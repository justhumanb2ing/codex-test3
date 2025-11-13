import * as crypto from "crypto"

import { generateReadingInsight } from "@/services/reading-insight-service"

describe("generateReadingInsight", () => {
  beforeEach(() => {
    let counter = 0
    jest.spyOn(crypto, "randomUUID").mockImplementation(() => {
      counter += 1
      return `uuid-${counter}`
    })
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it("returns empty insight when content is blank", async () => {
    await expect(generateReadingInsight("   ")).resolves.toEqual({
      summary: "",
      emotions: [],
      topics: [],
    })
  })

  it("generates summary and positive emotion when positive keywords exist", async () => {
    const result = await generateReadingInsight(
      "이 책은 정말 감동적이고 행복한 순간들로 가득 차 있어요.",
    )

    expect(result.summary).toContain("감동적이고 행복한 순간들")
    expect(result.emotions[0]?.label).toBe("긍정")
    expect(result.emotions[0]?.score).toBeGreaterThan(0.5)
  })

  it("extracts limited number of topics", async () => {
    const text = "우정과 용기 우정과 성장 우정과 희생"
    const result = await generateReadingInsight(text, { topicLimit: 2 })

    expect(result.topics).toHaveLength(2)
    expect(result.topics[0]?.value).toContain("우정")
  })
})
