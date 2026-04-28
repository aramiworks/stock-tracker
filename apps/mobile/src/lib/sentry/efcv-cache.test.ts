import { getCurrentEfcv, setCurrentEfcv } from "./efcv-cache";

describe("efcv-cache", () => {
  afterEach(() => {
    setCurrentEfcv({});
  });

  it("returns empty object before any value is set", () => {
    expect(getCurrentEfcv()).toEqual({});
  });

  it("returns value set by setCurrentEfcv", () => {
    setCurrentEfcv({
      experience: "tracker",
      flow: "dashboard",
      container: "home",
    });
    expect(getCurrentEfcv()).toEqual({
      experience: "tracker",
      flow: "dashboard",
      container: "home",
    });
  });

  it("overwrites previous value on subsequent set", () => {
    setCurrentEfcv({ experience: "auth" });
    setCurrentEfcv({ experience: "tracker", flow: "accounts" });
    expect(getCurrentEfcv()).toEqual({
      experience: "tracker",
      flow: "accounts",
    });
  });

  it("returns empty object after reset", () => {
    setCurrentEfcv({ experience: "tracker" });
    setCurrentEfcv({});
    expect(getCurrentEfcv()).toEqual({});
  });
});
