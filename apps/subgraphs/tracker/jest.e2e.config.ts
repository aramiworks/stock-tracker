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
    "^@stock-tracker/types$": "<rootDir>/../../../packages/types/src/index.ts",
    "^@stock-tracker/api/trpc$": "<rootDir>/../../api/src/trpc/router.ts",
    "^@stock-tracker/tracker-service/test-server$":
      "<rootDir>/../../services/tracker/src/test-server.ts",
    "^@stock-tracker/tracker-service/trpc$":
      "<rootDir>/../../services/tracker/src/trpc/trpc.router.ts",
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
    "node_modules/(?!(@stock-tracker|@nestjs|reflect-metadata)/)",
  ],
  testMatch: ["**/__tests__/**/*.e2e.test.ts"],
  testTimeout: 30000,
};

export default config;
