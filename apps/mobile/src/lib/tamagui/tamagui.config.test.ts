describe("tamagui config", () => {
  it("re-exports config from @aramiworks/ui as default", () => {
    // tamagui.config.ts does: export { config as default } from "@aramiworks/ui"
    // @aramiworks/ui is mocked in setup.ts with config: {}
    const mod = require("./tamagui.config");
    expect(mod.default).toBeDefined();
  });
});
