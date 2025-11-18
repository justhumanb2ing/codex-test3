import "@testing-library/jest-dom"

jest.mock("@/services/achievement-engine", () => ({
  processAchievements: jest.fn(),
}))
