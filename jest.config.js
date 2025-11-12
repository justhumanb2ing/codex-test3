/* eslint-disable @typescript-eslint/no-require-imports */
const os = require("os")
const nextJest = require("next/jest")

if (typeof os.availableParallelism !== "function") {
  os.availableParallelism = () => Math.max(1, os.cpus()?.length ?? 1)
}

const createJestConfig = nextJest({ dir: "./" })

const customJestConfig = {
  testMatch: ["**/*.jest.{ts,tsx}"],
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/tests/setup.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
    "^server-only$": "<rootDir>/tests/mocks/server-only.ts",
  },
}

module.exports = createJestConfig(customJestConfig)
