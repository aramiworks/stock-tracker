import { stateColors } from "./state";

describe("stateColors", () => {
  it("exposes the watchable-state palette as a const object", () => {
    expect(stateColors).toEqual({
      green: "#34c759",
      red: "#FF3B30",
      muted: "#808080",
      teal: "#009E99",
    });
  });
});
