const mockGetItem = jest.fn();
const mockSetItem = jest.fn();

jest.mock("@react-native-async-storage/async-storage", () => ({
  __esModule: true,
  default: {
    getItem: (...args: unknown[]) => mockGetItem(...args),
    setItem: (...args: unknown[]) => mockSetItem(...args),
  },
}));

const mockTrack = jest.fn();
const mockIdentify = jest.fn();
const mockReset = jest.fn();
const mockInit = jest.fn().mockResolvedValue(undefined);
const mockMixpanelCtor = jest.fn().mockImplementation(() => ({
  init: mockInit,
  track: mockTrack,
  identify: mockIdentify,
  reset: mockReset,
}));

jest.mock("mixpanel-react-native", () => ({
  Mixpanel: mockMixpanelCtor,
}));

type AnalyticsModule = typeof import("./analytics");

const loadModule = (): AnalyticsModule => {
  let mod: AnalyticsModule;
  jest.isolateModules(() => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    mod = require("./analytics");
  });
  return mod!;
};

describe("analytics", () => {
  const TOKEN = "test-token";

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetItem.mockReset();
    mockSetItem.mockReset();
    process.env.EXPO_PUBLIC_MIXPANEL_TOKEN = TOKEN;
  });

  afterEach(() => {
    delete process.env.EXPO_PUBLIC_MIXPANEL_TOKEN;
  });

  it("initAnalytics is a no-op when no token is set", async () => {
    delete process.env.EXPO_PUBLIC_MIXPANEL_TOKEN;
    const { initAnalytics } = loadModule();
    initAnalytics();
    await Promise.resolve();
    expect(mockMixpanelCtor).not.toHaveBeenCalled();
  });

  it("initAnalytics constructs Mixpanel once with the token", async () => {
    const { initAnalytics } = loadModule();
    initAnalytics();
    initAnalytics();
    await Promise.resolve();
    await Promise.resolve();
    expect(mockMixpanelCtor).toHaveBeenCalledTimes(1);
    expect(mockMixpanelCtor).toHaveBeenCalledWith(TOKEN, false);
    expect(mockInit).toHaveBeenCalledTimes(1);
  });

  it("returns the cached Mixpanel instance on subsequent calls", async () => {
    mockGetItem.mockResolvedValue("granted");
    const { trackEvent } = loadModule();
    await trackEvent("first");
    await trackEvent("second");
    expect(mockMixpanelCtor).toHaveBeenCalledTimes(1);
    expect(mockTrack).toHaveBeenCalledTimes(2);
  });

  it("trackEvent drops the event without consent", async () => {
    mockGetItem.mockResolvedValue(null);
    const { trackEvent } = loadModule();
    await trackEvent("foo");
    expect(mockTrack).not.toHaveBeenCalled();
  });

  it("trackEvent forwards to Mixpanel.track when consent is granted", async () => {
    mockGetItem.mockResolvedValue("granted");
    const { trackEvent } = loadModule();
    await trackEvent("foo", { bar: 1 });
    expect(mockTrack).toHaveBeenCalledWith("foo", { bar: 1 });
  });

  it("trackEvent no-ops without a token (after consent)", async () => {
    delete process.env.EXPO_PUBLIC_MIXPANEL_TOKEN;
    mockGetItem.mockResolvedValue("granted");
    const { trackEvent } = loadModule();
    await trackEvent("foo");
    expect(mockTrack).not.toHaveBeenCalled();
  });

  it("identifyUser drops without consent", async () => {
    mockGetItem.mockResolvedValue(null);
    const { identifyUser } = loadModule();
    await identifyUser("user-123");
    expect(mockIdentify).not.toHaveBeenCalled();
  });

  it("identifyUser forwards the user id when consent is granted", async () => {
    mockGetItem.mockResolvedValue("granted");
    const { identifyUser } = loadModule();
    await identifyUser("user-123");
    expect(mockIdentify).toHaveBeenCalledWith("user-123");
  });

  it("identifyUser no-ops without a token (after consent)", async () => {
    delete process.env.EXPO_PUBLIC_MIXPANEL_TOKEN;
    mockGetItem.mockResolvedValue("granted");
    const { identifyUser } = loadModule();
    await identifyUser("user-123");
    expect(mockIdentify).not.toHaveBeenCalled();
  });

  it("resetAnalytics calls Mixpanel.reset regardless of consent", async () => {
    mockGetItem.mockResolvedValue(null);
    const { resetAnalytics } = loadModule();
    await resetAnalytics();
    expect(mockReset).toHaveBeenCalled();
  });

  it("resetAnalytics no-ops without a token", async () => {
    delete process.env.EXPO_PUBLIC_MIXPANEL_TOKEN;
    const { resetAnalytics } = loadModule();
    await resetAnalytics();
    expect(mockReset).not.toHaveBeenCalled();
  });

  it("trackScreen returns early when all efcv values are undefined", async () => {
    mockGetItem.mockResolvedValue("granted");
    const { trackScreen } = loadModule();
    await trackScreen(undefined, undefined, undefined);
    expect(mockTrack).not.toHaveBeenCalled();
  });

  it("trackScreen emits screen_viewed with efcv tags when at least one is set", async () => {
    mockGetItem.mockResolvedValue("granted");
    const { trackScreen } = loadModule();
    await trackScreen("tracker", "dashboard", "home");
    expect(mockTrack).toHaveBeenCalledWith("screen_viewed", {
      experience: "tracker",
      flow: "dashboard",
      container: "home",
    });
  });
});
