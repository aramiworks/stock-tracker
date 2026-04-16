import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest/presets/default-esm",
  testEnvironment: "node",
  extensionsToTreatAsEsm: [".ts"],
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
    "^@stock-tracker/prisma/client$":
      "<rootDir>/../../../packages/prisma/src/client.ts",
    "^@stock-tracker/prisma$":
      "<rootDir>/../../../packages/prisma/src/index.ts",
    "^@stock-tracker/validation$":
      "<rootDir>/../../../packages/validation/src/index.ts",
    "^@stock-tracker/types$":
      "<rootDir>/../../../packages/types/src/index.ts",
    "^@stock-tracker/config$":
      "<rootDir>/../../../packages/config/src/index.ts",
    "^@stock-tracker/nestjs-common$":
      "<rootDir>/../../../packages/nestjs-common/src/index.ts",
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
  transformIgnorePatterns: [
    "node_modules/(?!(@stock-tracker|@nestjs|rxjs)/)",
  ],
  testMatch: ["**/*.test.ts"],
  testTimeout: 30000,
  collectCoverage: true,
  coverageReporters: ["lcov", "text"],
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/**/index.ts",
    "!src/main.ts",
    "!src/**/*.test.ts",
    "!src/**/*.experience.ts",
    "!src/**/*.views.ts",
  ],
};

export default config;
