import { stateColors } from "./state";

describe("stateColors", () => {
  it("exposes the watchable-state palette as a const object", () => {
    expect(stateColors).toEqual({
      green: "#34c759",
      red: "#ff2d55",
      muted: "#808080",
    });
  });
});
