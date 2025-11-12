import os from "node:os"
import nextJest from "next/jest"

const getAvailableParallelism = () =>
  typeof os.availableParallelism === "function"
    ? os.availableParallelism()
    : Math.max(1, os.cpus()?.length ?? 1)

if (typeof os.availableParallelism !== "function") {
  Object.defineProperty(os, "availableParallelism", {
    value: getAvailableParallelism,
    configurable: true,
    writable: false,
  })
}

const createJestConfig = nextJest({ dir: "./" })

const customJestConfig = {
  testMatch: ["**/*.jest.{ts,tsx}"],
  testEnvironment: "jsdom",
  maxWorkers: getAvailableParallelism(),
  setupFilesAfterEnv: ["<rootDir>/tests/setup.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
    "^server-only$": "<rootDir>/tests/mocks/server-only.ts",
  },
}

export default createJestConfig(customJestConfig)
