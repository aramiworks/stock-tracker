import { ExpoConfig, ConfigContext } from "expo/config";

const { version } = require("./package.json");
const [major, minor] = version.split(".");

const ENV_SUFFIX: Record<string, string> = {
  local: ".local",
  develop: ".develop",
  stage: ".stage",
  master: "",
};

const ENV_NAME: Record<string, string> = {
  local: " (Local)",
  develop: " (Dev)",
  stage: " (Stage)",
  master: "",
};

const appEnv = process.env.APP_ENV ?? "local";
const suffix = ENV_SUFFIX[appEnv] ?? ".local";
const nameSuffix = ENV_NAME[appEnv] ?? " (Local)";

function reverseClientId(clientId?: string): string | undefined {
  return clientId ? clientId.split(".").reverse().join(".") : undefined;
}

const iosOAuthScheme = reverseClientId(
  process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
);

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  owner: "aramiworks",
  name: `Stock Tracker${nameSuffix}`,
  slug: "stock-tracker",
  version: "0.0.1",
  orientation: "portrait",
  scheme: `so.arami.stocktracker.app${suffix}`,
  ios: {
    supportsTablet: false,
    bundleIdentifier: `so.arami.stocktracker.app${suffix}`,
  },
  android: {
    adaptiveIcon: {
      backgroundColor: "#FF2D55",
    },
    package: `so.arami.stocktracker.app${suffix}`,
  },
  web: {
    bundler: "metro",
    output: "single",
  },
  plugins: [
    "expo-router",
    "expo-updates",
    "expo-secure-store",
    "expo-web-browser",
    // Only apply the Google Sign-In plugin when the iOS URL scheme is available
    // (requires EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID — always set in EAS + Doppler builds).
    ...(iosOAuthScheme
      ? [
          [
            "@react-native-google-signin/google-signin",
            { iosUrlScheme: iosOAuthScheme },
          ] as [string, unknown],
        ]
      : []),
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    eas: {
      projectId: "73ca08db-3807-4b8a-9aff-4058cd066b22",
    },
  },
  updates: {
    url: "https://u.expo.dev/73ca08db-3807-4b8a-9aff-4058cd066b22",
  },
  runtimeVersion: `${major}.${minor}`,
});
