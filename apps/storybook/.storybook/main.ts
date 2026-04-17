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
    // which has no equivalent in react-native-web.
    const reactFabricMockPlugin = {
      name: "mock-react-native-ReactFabric",
      // enforce: "pre" so this runs before Vite's built-in alias plugin,
      // intercepting the original import path before it gets rewritten to
      // react-native-web/Libraries/Renderer/shims/ReactFabric (which doesn't exist).
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
    config.plugins = [...(config.plugins ?? []), reactFabricMockPlugin];

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
      { find: "react-native", replacement: "react-native-web" },
      { find: "@", replacement: path.resolve(__dirname, "../../mobile/src") },
      {
        find: "@tock-tracker/validation",
        replacement: path.resolve(
          __dirname,
          "../../../packages/validation/src/index.ts",
        ),
      },
      ...existingAliases.filter(
        (a) =>
          (a as { find: string }).find !== "react-native" &&
          (a as { find: string }).find !== "@" &&
          (a as { find: string }).find !== "@expo/vector-icons" &&
          (a as { find: string }).find !== "@expo/vector-icons/MaterialIcons" &&
          (a as { find: string }).find !== "@tock-tracker/validation",
      ),
    ];
    // @aramiworks/ui ships TypeScript source (.tsx files). Exclude from
    // pre-bundling so Vite processes it through the regular TSX transform.
    config.optimizeDeps = config.optimizeDeps || {};
    config.optimizeDeps.exclude = [
      ...(config.optimizeDeps.exclude || []),
      "@aramiworks/ui",
    ];
    return config;
  },
};

export default config;
