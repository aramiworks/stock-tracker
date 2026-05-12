import { describe, expect, it, beforeEach, afterEach } from "@jest/globals";
import { buildProxyAuth, getProxyFromEnv } from "./proxy.js";
import type { Proxy } from "./Fetcher.js";

describe("buildProxyAuth", () => {
  it("appends -cc-{countryCode} to the username", () => {
    const proxy: Proxy = {
      host: "pr.oxylabs.io",
      port: 7777,
      username: "customer-stocktracker_scraper_AmaJY",
      password: "secret123",
      countryCode: "KR",
    };
    const auth = buildProxyAuth(proxy);
    expect(auth.username).toBe("customer-stocktracker_scraper_AmaJY-cc-KR");
    expect(auth.password).toBe("secret123");
  });

  it("works with different country codes", () => {
    const proxy: Proxy = {
      host: "pr.oxylabs.io",
      port: 7777,
      username: "customer-test",
      password: "pw",
      countryCode: "US",
    };
    expect(buildProxyAuth(proxy).username).toBe("customer-test-cc-US");
  });
});

describe("getProxyFromEnv", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("returns a Proxy when all env vars are set", () => {
    process.env.PROXY_HOST = "pr.oxylabs.io";
    process.env.PROXY_PORT = "7777";
    process.env.PROXY_USERNAME = "customer-test";
    process.env.PROXY_PASSWORD = "secret";
    process.env.PROXY_COUNTRY_CODE = "KR";

    const proxy = getProxyFromEnv();
    expect(proxy).toEqual({
      host: "pr.oxylabs.io",
      port: 7777,
      username: "customer-test",
      password: "secret",
      countryCode: "KR",
    });
  });

  it("throws when env vars are missing", () => {
    delete process.env.PROXY_HOST;
    delete process.env.PROXY_PORT;
    delete process.env.PROXY_USERNAME;
    delete process.env.PROXY_PASSWORD;
    delete process.env.PROXY_COUNTRY_CODE;

    expect(() => getProxyFromEnv()).toThrow("Missing proxy env vars");
  });

  it("includes all missing var names in the error", () => {
    delete process.env.PROXY_HOST;
    delete process.env.PROXY_PORT;
    delete process.env.PROXY_USERNAME;
    delete process.env.PROXY_PASSWORD;
    delete process.env.PROXY_COUNTRY_CODE;

    expect(() => getProxyFromEnv()).toThrow("PROXY_HOST");
    expect(() => getProxyFromEnv()).toThrow("PROXY_PASSWORD");
  });
});
