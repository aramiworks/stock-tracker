// expo-constants transitively imports expo-modules-core, which uses
// `TurboModuleRegistry` from react-native — a native API with no
// react-native-web equivalent. Stub the module so Storybook web can
// resolve `import Constants from "expo-constants"` without bundling
// the native runtime.

export default {
  expoConfig: { version: "1.0.0-storybook" },
  manifest: { version: "1.0.0-storybook" },
  manifest2: null,
  appOwnership: null,
  executionEnvironment: "storeClient",
  experienceUrl: "",
  expoVersion: "0.0.0",
  isDevice: false,
  isHeadless: true,
  platform: { ios: {}, android: {} },
  sessionId: "storybook",
  statusBarHeight: 0,
  systemFonts: [],
};
