import { getEfcvFromSegments } from "./get-efcv-from-route";

describe("getEfcvFromSegments", () => {
  it("returns all undefined for empty segments", () => {
    expect(getEfcvFromSegments([])).toEqual({
      experience: undefined,
      flow: undefined,
      container: undefined,
    });
  });

  it("maps (app) group to tracker experience", () => {
    expect(getEfcvFromSegments(["(app)", "dashboard", "home"])).toEqual({
      experience: "tracker",
      flow: "dashboard",
      container: "home",
    });
  });

  it("maps (auth) group to auth experience", () => {
    expect(getEfcvFromSegments(["(auth)", "signIn"])).toEqual({
      experience: "auth",
      flow: "signIn",
      container: undefined,
    });
  });

  it("returns undefined experience for unknown route group", () => {
    expect(getEfcvFromSegments(["unknown", "flow"])).toEqual({
      experience: undefined,
      flow: "flow",
      container: undefined,
    });
  });
});
