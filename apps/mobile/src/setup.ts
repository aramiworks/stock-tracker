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
      getUser: jest.fn().mockResolvedValue({ data: { user: null } }),
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
  const React = require("react");
  const passthrough = (props: Record<string, unknown>) =>
    React.createElement(View, { testID: props.testID }, props.children);
  const showConfirmDialog = jest.fn();
  return {
    config: {},
    colors: {
      primary: "#0066FF",
      onPrimary: "#FFFFFF",
      primaryContainer: "#70737C29",
      onPrimaryContainer: "#0066FF",
      secondary: "#37383C9C",
      onSecondary: "#FFFFFF",
      tertiary: "#989BA2",
      error: "#BA1A1A",
      onError: "#FFFFFF",
      surface: "#FFFFFF",
      onSurface: "#1A1C1E",
      outline: "#73777F",
      outlineVariant: "#C3C7CF",
    },
    useConfirmDialog: () => ({
      showConfirmDialog,
      ConfirmDialogPortal: () => null,
    }),
    XStack: passthrough,
    YStack: passthrough,
    Skeleton: (props: Record<string, unknown>) =>
      React.createElement(View, { testID: props.testID || "skeleton" }),
    Checkbox: (props: Record<string, unknown>) =>
      React.createElement(View, {
        testID: props.testID,
        onPress: props.onPress,
        accessibilityLabel: props.accessibilityLabel,
        accessibilityState: { checked: props.state === "checked" },
      }),
    Spacer: () => React.createElement(View),
    EmptyStateTemplate: (props: Record<string, unknown>) =>
      React.createElement(
        View,
        { testID: props.testID },
        props.icon ?? null,
        React.createElement(RNText, null, props.title),
        React.createElement(RNText, null, props.body),
        props.action ?? null,
      ),
    Button: (props: Record<string, unknown>) =>
      React.createElement(
        View,
        { testID: props.testID, onPress: props.onPress },
        React.createElement(RNText, null, props.children),
      ),
    Card: (props: Record<string, unknown>) =>
      React.createElement(
        View,
        {
          testID: props.testID,
          onPress: props.onPress,
          onLongPress: props.onLongPress,
        },
        props.children,
      ),
    Text: (props: Record<string, unknown>) =>
      React.createElement(RNText, props, props.children),
    FAB: (props: Record<string, unknown>) =>
      React.createElement(View, {
        testID: props.testID,
        onPress: props.onPress,
        accessibilityLabel: props.accessibilityLabel,
      }),
    FormField: (props: Record<string, unknown>) =>
      React.createElement(View, {
        testID: props.testID || "form-field",
      }),
    SearchBar: (props: Record<string, unknown>) =>
      React.createElement(View, {
        testID: props.testID || "search-bar",
      }),
    ProgressIndicator: () =>
      React.createElement(View, { testID: "progress-indicator" }),
    OverviewLayout: passthrough,
    DashboardTemplate: (props: Record<string, unknown>) =>
      React.createElement(
        View,
        { testID: props.testID },
        props.topBar ?? null,
        props.children ?? null,
        props.fab ?? null,
      ),
    ListTemplate: (props: Record<string, unknown>) =>
      React.createElement(
        View,
        { testID: props.testID },
        props.topBar ?? null,
        props.headerContent ?? null,
        props.children ?? null,
        props.fab ?? null,
      ),
    DetailTemplate: (props: Record<string, unknown>) =>
      React.createElement(
        View,
        { testID: props.testID },
        props.topBar ?? null,
        props.children ?? null,
      ),
    TopAppBar: (props: Record<string, unknown>) =>
      React.createElement(
        View,
        { testID: props.testID },
        props.navigationIcon
          ? React.createElement(View, {
              testID: `${props.testID}-back`,
              onPress: props.onNavigationPress,
            })
          : null,
        props.trailingContent ?? null,
      ),
    FullScreenDialog: (props: Record<string, unknown>) =>
      props.visible
        ? React.createElement(
            View,
            { testID: props.testID },
            props.title ? React.createElement(RNText, null, props.title) : null,
            React.createElement(View, {
              testID: props.testID ? `${props.testID}-close` : undefined,
              onPress: props.onClose,
            }),
            React.createElement(View, {
              testID: props.testID ? `${props.testID}-action` : undefined,
              onPress: props.actionDisabled ? undefined : props.onAction,
            }),
            props.children,
          )
        : null,
    Snackbar: (props: Record<string, unknown>) =>
      props.visible
        ? React.createElement(
            View,
            { testID: props.testID },
            React.createElement(RNText, null, props.message),
            React.createElement(View, {
              testID: props.testID ? `${props.testID}-dismiss` : undefined,
              onPress: props.onDismiss,
            }),
          )
        : null,
  };
});

// mixpanel-react-native
jest.mock("mixpanel-react-native", () => ({
  Mixpanel: jest.fn().mockImplementation(() => ({
    init: jest.fn().mockResolvedValue(undefined),
    track: jest.fn(),
    identify: jest.fn(),
    reset: jest.fn(),
  })),
}));

// @react-native-async-storage/async-storage
jest.mock("@react-native-async-storage/async-storage", () => ({
  __esModule: true,
  default: {
    getItem: jest.fn().mockResolvedValue(null),
    setItem: jest.fn().mockResolvedValue(undefined),
    removeItem: jest.fn().mockResolvedValue(undefined),
  },
}));

// react-native-url-polyfill
jest.mock("react-native-url-polyfill/auto", () => {});

// react-native-reanimated
jest.mock("react-native-reanimated", () =>
  require("react-native-reanimated/mock"),
);
