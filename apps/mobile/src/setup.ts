/* eslint-disable @typescript-eslint/no-empty-function */

// expo-router
jest.mock("expo-router", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    canGoBack: jest.fn().mockReturnValue(false),
  }),
  useLocalSearchParams: () => ({}),
  useGlobalSearchParams: () => ({}),
  useSegments: () => [],
  usePathname: () => "/",
  useFocusEffect: (cb: () => void) => cb(),
  useNavigation: () => ({ setOptions: jest.fn() }),
  Redirect: ({ href }: { href: string }) => `Redirect to ${href}`,
  Slot: () => "Slot",
  Link: ({ children }: { children: React.ReactNode }) => children,
}));

// Supabase
jest.mock("@supabase/supabase-js", () => ({
  createClient: jest.fn(() => ({
    auth: {
      getSession: jest.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: jest.fn(() => ({
        data: { subscription: { unsubscribe: jest.fn() } },
      })),
      signInWithIdToken: jest.fn(),
      signOut: jest.fn(),
    },
  })),
}));

// expo-secure-store
jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn().mockResolvedValue(null),
  setItemAsync: jest.fn().mockResolvedValue(undefined),
  deleteItemAsync: jest.fn().mockResolvedValue(undefined),
}));

// expo-auth-session
jest.mock("expo-auth-session/providers/google", () => ({
  useAuthRequest: jest.fn(() => [null, null, jest.fn()]),
}));

// Google Sign-In
jest.mock("@react-native-google-signin/google-signin", () => ({
  GoogleSignin: {
    configure: jest.fn(),
    hasPlayServices: jest.fn().mockResolvedValue(true),
    signIn: jest.fn().mockResolvedValue({ data: { idToken: "mock-token" } }),
  },
}));

// expo-web-browser
jest.mock("expo-web-browser", () => ({
  maybeCompleteAuthSession: jest.fn(),
  openBrowserAsync: jest.fn(),
}));

// react-i18next
jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { changeLanguage: jest.fn(), language: "ko" },
  }),
  initReactI18next: { type: "3rdParty", init: jest.fn() },
  Trans: ({ children }: { children: React.ReactNode }) => children,
}));

// @aramiworks/ui — stub all exported components as simple passthrough
jest.mock("@aramiworks/ui", () => {
  const { View, Text: RNText } = require("react-native");
  return {
    config: {},
    Button: (props: Record<string, unknown>) =>
      require("react").createElement(
        View,
        { testID: props.testID },
        require("react").createElement(RNText, null, props.children),
      ),
    Text: (props: Record<string, unknown>) =>
      require("react").createElement(RNText, props, props.children),
    FAB: (props: Record<string, unknown>) =>
      require("react").createElement(View, {
        testID: props.testID,
        onPress: props.onPress,
      }),
    FormField: (props: Record<string, unknown>) =>
      require("react").createElement(View, {
        testID: props.testID || "form-field",
      }),
    SearchBar: (props: Record<string, unknown>) =>
      require("react").createElement(View, {
        testID: props.testID || "search-bar",
      }),
    ProgressIndicator: () =>
      require("react").createElement(View, { testID: "progress-indicator" }),
    OverviewLayout: (props: Record<string, unknown>) =>
      require("react").createElement(View, null, props.children),
    DashboardTemplate: (props: Record<string, unknown>) => {
      const React = require("react");
      return React.createElement(
        View,
        { testID: props.testID },
        props.topBar ?? null,
        props.children ?? null,
        props.fab ?? null,
      );
    },
    ListTemplate: (props: Record<string, unknown>) => {
      const React = require("react");
      return React.createElement(
        View,
        { testID: props.testID },
        props.topBar ?? null,
        props.headerContent ?? null,
        props.children ?? null,
        props.fab ?? null,
      );
    },
    DetailTemplate: (props: Record<string, unknown>) => {
      const React = require("react");
      return React.createElement(
        View,
        { testID: props.testID },
        props.topBar ?? null,
        props.children ?? null,
      );
    },
  };
});

// react-native-url-polyfill
jest.mock("react-native-url-polyfill/auto", () => {});

// react-native-reanimated
jest.mock("react-native-reanimated", () =>
  require("react-native-reanimated/mock"),
);
