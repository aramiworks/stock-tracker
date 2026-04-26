import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest/presets/default-esm",
  testEnvironment: "node",
  extensionsToTreatAsEsm: [".ts"],
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
    "^@stock-tracker/prisma/client$":
      "<rootDir>/../../packages/prisma/src/client.ts",
    "^@stock-tracker/prisma$": "<rootDir>/../../packages/prisma/src/index.ts",
    "^@stock-tracker/validation$":
      "<rootDir>/../../packages/validation/src/index.ts",
    "^@stock-tracker/types$": "<rootDir>/../../packages/types/src/index.ts",
    "^@stock-tracker/config$": "<rootDir>/../../packages/config/src/index.ts",
  },
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        useESM: true,
        tsconfig: "tsconfig.json",
      },
    ],
  },
  transformIgnorePatterns: ["node_modules/(?!(@stock-tracker|jose)/)"],
  testMatch: ["**/*.test.ts", "!**/*.e2e.test.ts"],
  testTimeout: 30000,
  collectCoverage: true,
  coverageReporters: ["lcov", "text"],
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/**/index.ts",
    "!src/server.ts",
    "!src/**/*.e2e.test.ts",
    "!src/**/*.test.ts",
    // Empty stubs (export {})
    "!src/**/*.lifecycles.ts",
    "!src/**/*.experience.ts",
    // Router procedure wiring (lambda bodies tested via controller tests)
    "!src/trpc/auth.router.ts",
    // Thin config wrapper (delegates to @stock-tracker/config)
    "!src/common/logger.ts",
  ],
  coverageThreshold: {
    global: { branches: 100, functions: 100, lines: 100, statements: 100 },
  },
};

export default config;
