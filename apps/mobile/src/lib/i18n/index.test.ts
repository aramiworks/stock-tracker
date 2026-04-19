describe("i18n", () => {
  it("initializes i18next with Korean language", () => {
    const i18n = require("./index").default;
    expect(i18n).toBeDefined();
    expect(i18n.language).toBe("ko");
  });

  it("has common, auth, and tracker namespaces", () => {
    const i18n = require("./index").default;
    expect(i18n.options.ns).toEqual(["common", "auth", "tracker"]);
    expect(i18n.options.defaultNS).toBe("common");
  });

  it("has Korean resource bundles loaded", () => {
    const i18n = require("./index").default;
    expect(i18n.hasResourceBundle("ko", "common")).toBe(true);
    expect(i18n.hasResourceBundle("ko", "auth")).toBe(true);
    expect(i18n.hasResourceBundle("ko", "tracker")).toBe(true);
  });

  it("sets fallback language to Korean", () => {
    const i18n = require("./index").default;
    expect(i18n.options.fallbackLng).toEqual(["ko"]);
  });
});
