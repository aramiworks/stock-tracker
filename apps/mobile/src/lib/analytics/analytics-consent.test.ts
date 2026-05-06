import AsyncStorage from "@react-native-async-storage/async-storage";

const getItemMock = AsyncStorage.getItem as jest.Mock;
const setItemMock = AsyncStorage.setItem as jest.Mock;

type ConsentModule = typeof import("./analytics-consent");

const loadModule = (): ConsentModule => {
  let mod: ConsentModule;
  jest.isolateModules(() => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    mod = require("./analytics-consent");
  });
  return mod!;
};

describe("analytics-consent", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getItemMock.mockReset();
    setItemMock.mockReset();
  });

  it("returns false when no consent value is stored", async () => {
    getItemMock.mockResolvedValueOnce(null);
    const { hasAnalyticsConsent } = loadModule();
    expect(await hasAnalyticsConsent()).toBe(false);
  });

  it("returns true when consent is granted", async () => {
    getItemMock.mockResolvedValueOnce("granted");
    const { hasAnalyticsConsent } = loadModule();
    expect(await hasAnalyticsConsent()).toBe(true);
  });

  it("caches the consent result across calls", async () => {
    getItemMock.mockResolvedValueOnce("granted");
    const { hasAnalyticsConsent } = loadModule();
    await hasAnalyticsConsent();
    await hasAnalyticsConsent();
    expect(getItemMock).toHaveBeenCalledTimes(1);
  });

  it("returns false when AsyncStorage.getItem rejects", async () => {
    getItemMock.mockRejectedValueOnce(new Error("storage offline"));
    const { hasAnalyticsConsent } = loadModule();
    expect(await hasAnalyticsConsent()).toBe(false);
  });

  it("grantAnalyticsConsent writes 'granted' and updates cache", async () => {
    getItemMock.mockResolvedValueOnce(null);
    setItemMock.mockResolvedValueOnce(undefined);
    const { grantAnalyticsConsent, hasAnalyticsConsent } = loadModule();
    await grantAnalyticsConsent();
    expect(setItemMock).toHaveBeenCalledWith("analytics:consent", "granted");
    expect(await hasAnalyticsConsent()).toBe(true);
  });

  it("grantAnalyticsConsent swallows AsyncStorage errors", async () => {
    setItemMock.mockRejectedValueOnce(new Error("disk full"));
    const { grantAnalyticsConsent, hasAnalyticsConsent } = loadModule();
    await expect(grantAnalyticsConsent()).resolves.toBeUndefined();
    expect(await hasAnalyticsConsent()).toBe(true);
  });

  it("denyAnalyticsConsent writes 'denied' and updates cache", async () => {
    setItemMock.mockResolvedValueOnce(undefined);
    const { denyAnalyticsConsent, hasAnalyticsConsent } = loadModule();
    await denyAnalyticsConsent();
    expect(setItemMock).toHaveBeenCalledWith("analytics:consent", "denied");
    expect(await hasAnalyticsConsent()).toBe(false);
  });

  it("denyAnalyticsConsent swallows AsyncStorage errors", async () => {
    setItemMock.mockRejectedValueOnce(new Error("disk full"));
    const { denyAnalyticsConsent, hasAnalyticsConsent } = loadModule();
    await expect(denyAnalyticsConsent()).resolves.toBeUndefined();
    expect(await hasAnalyticsConsent()).toBe(false);
  });
});
