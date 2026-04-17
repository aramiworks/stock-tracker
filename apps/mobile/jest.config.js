/** @type {import('jest').Config} */
module.exports = {
  preset: "jest-expo",
  setupFiles: ["<rootDir>/src/setup.ts"],
  transformIgnorePatterns: [
    "node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@sentry/react-native|native-base|react-native-svg|@cheunjm/ui|@aramiworks/ui)",
  ],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    // jest-expo auto-generates this from tsconfig paths, but @aramiworks/ui is a
    // private package not installed in all envs. Override with a valid file path
    // so Jest's config validation passes; jest.mock() in setup.ts provides the
    // actual mock at runtime.
    "^@aramiworks/ui$": "<rootDir>/package.json",
  },
  testMatch: ["**/*.test.ts", "**/*.test.tsx"],
  collectCoverage: true,
  coverageReporters: ["lcov", "text"],
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/index.ts",
    "!src/**/*.story.tsx",
    "!src/**/*.type.ts",
    "!src/**/*.test.ts",
    "!src/**/*.test.tsx",
    "!src/lib/graphql/generated/**",
    "!src/setup.ts",
    "!src/test-utils.tsx",
  ],
  // TODO: enforce 100% once all coverage gaps are filled
  // coverageThreshold: {
  //   global: { branches: 100, functions: 100, lines: 100, statements: 100 },
  // },
};
