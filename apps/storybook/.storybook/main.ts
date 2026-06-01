import type { StorybookConfig } from "@storybook/react-vite";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const config: StorybookConfig = {
  stories: ["../../mobile/src/**/*.story.@(ts|tsx)"],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  addons: ["@storybook/addon-designs"],
  viteFinal: async (config) => {
    config.resolve = config.resolve || {};
    // Use array format so more-specific aliases are matched before prefix aliases.
    // Vite's object alias does prefix matching: "@expo/vector-icons" would match
    // "@expo/vector-icons/MaterialIcons" before the explicit entry does.
    const existingAliases = Array.isArray(config.resolve.alias)
      ? config.resolve.alias
      : Object.entries(config.resolve.alias || {}).map(
          ([find, replacement]) => ({
            find,
            replacement: replacement as string,
          }),
        );
    // Virtual module plugin: stubs react-native-reanimated's ReactFabric import,
    // which has no equivalent in react-native-web. Must run before Vite's alias
    // plugin rewrites the path to react-native-web/... (which doesn't exist).
    const reactFabricMockPlugin = {
      name: "mock-react-native-ReactFabric",
      enforce: "pre" as const,
      resolveId(id: string) {
        if (
          id === "react-native/Libraries/Renderer/shims/ReactFabric" ||
          id === "react-native-web/Libraries/Renderer/shims/ReactFabric"
        ) {
          return "\0react-native-ReactFabric-mock";
        }
      },
      load(id: string) {
        if (id === "\0react-native-ReactFabric-mock") {
          return "export default null; export const findHostInstance_DEPRECATED = () => null; export const findNodeHandle = () => null;";
        }
      },
    };
    // Virtual module plugin: stubs react-native-safe-area-context's
    // codegenNativeComponent import (used in NativeSafeAreaView.js). Must run
    // before Vite's alias plugin rewrites it to react-native-web/... (which
    // doesn't exist).
    const codegenNativeComponentMockPlugin = {
      name: "mock-react-native-codegenNativeComponent",
      enforce: "pre" as const,
      resolveId(id: string) {
        if (id === "react-native/Libraries/Utilities/codegenNativeComponent") {
          return "\0react-native-codegenNativeComponent-mock";
        }
      },
      load(id: string) {
        if (id === "\0react-native-codegenNativeComponent-mock") {
          return "export default function codegenNativeComponent() { return function NativeComponent() { return null; }; }";
        }
      },
    };
    config.plugins = [
      ...(config.plugins ?? []),
      reactFabricMockPlugin,
      codegenNativeComponentMockPlugin,
    ];

    config.resolve.alias = [
      // Specific sub-path aliases must come before prefix aliases
      {
        find: "@expo/vector-icons/MaterialIcons",
        replacement: path.resolve(__dirname, "./mocks/expo-vector-icons.js"),
      },
      {
        find: "@expo/vector-icons",
        replacement: path.resolve(__dirname, "./mocks/expo-vector-icons.js"),
      },
      // Mock all of react-native-reanimated — it uses native modules (TurboModuleRegistry,
      // ReactFabric) absent from react-native-web. Components render without animations.
      {
        find: "react-native-reanimated",
        replacement: path.resolve(
          __dirname,
          "./mocks/react-native-reanimated.js",
        ),
      },
      // Mock react-native-safe-area-context — its native specs import
      // react-native/Libraries/Utilities/codegenNativeComponent which has no
      // react-native-web equivalent. Components render with zero insets.
      {
        find: "react-native-safe-area-context",
        replacement: path.resolve(
          __dirname,
          "./mocks/react-native-safe-area-context.js",
        ),
      },
      { find: "react-native", replacement: "react-native-web" },
      // Mock expo-router — useRouter, useSegments, Slot, Link, Redirect stubs;
      // no router provider is set up in Storybook so this prevents render errors
      // in components that call useRouter().
      {
        find: "expo-router",
        replacement: path.resolve(__dirname, "./mocks/expo-router.js"),
      },
      // Mock react-i18next — useTranslation returns key passthrough; no i18n
      // provider is set up in Storybook so this prevents render errors in views
      // that call t("namespace.key").
      {
        find: "react-i18next",
        replacement: path.resolve(__dirname, "./mocks/react-i18next.js"),
      },
      { find: "@", replacement: path.resolve(__dirname, "../../mobile/src") },
      {
        find: "@stock-tracker/validation",
        replacement: path.resolve(
          __dirname,
          "../../../packages/validation/src/index.ts",
        ),
      },
      ...existingAliases.filter(
        (a) =>
          (a as { find: string }).find !== "react-native" &&
          (a as { find: string }).find !== "react-native-reanimated" &&
          (a as { find: string }).find !== "react-native-safe-area-context" &&
          (a as { find: string }).find !== "@" &&
          (a as { find: string }).find !== "@expo/vector-icons" &&
          (a as { find: string }).find !== "@expo/vector-icons/MaterialIcons" &&
          (a as { find: string }).find !== "@stock-tracker/validation" &&
          (a as { find: string }).find !== "react-i18next" &&
          (a as { find: string }).find !== "expo-router",
      ),
    ];
    // @aramiworks/ui ships TypeScript source (.tsx files). Exclude from
    // pre-bundling so Vite processes it through the regular TSX transform.
    config.optimizeDeps = config.optimizeDeps || {};
    config.optimizeDeps.exclude = [
      ...(config.optimizeDeps.exclude || []),
      "@aramiworks/ui",
    ];
    // React 19's CJS packages have no "import" ESM export condition, so Vite 8
    // serves them raw via @fs/... instead of pre-bundling them. .mjs files from
    // framer-motion/Tamagui do named ESM imports (e.g. `import { jsx } from
    // 'react/jsx-runtime'`, `import { createPortal } from 'react-dom'`) which
    // fail against the raw CJS file. Force pre-bundling to convert CJS → ESM.
    //
    // react-native-web ships nested node_modules with CJS-only deps; use the
    // `parent > child` syntax so Vite pre-bundles them in the right context.
    config.optimizeDeps.include = [
      ...(config.optimizeDeps.include || []),
      "react/jsx-runtime",
      "react/jsx-dev-runtime",
      "react-dom",
      "react-native-web > @react-native/normalize-colors",
      "react-native-web > memoize-one",
    ];
    return config;
  },
};

export default config;
