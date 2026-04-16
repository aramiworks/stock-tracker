import { describe, expect, it, jest } from "@jest/globals";
import { createLogger } from "./logger.js";

describe("createLogger", () => {
  describe("env: test", () => {
    it("sets level to silent", () => {
      const logger = createLogger({ service: "test-svc", env: "test" });
      expect(logger.level).toBe("silent");
    });

    it("sets base.service", () => {
      const logger = createLogger({ service: "test-svc", env: "test" });
      expect(logger.bindings()).toMatchObject({ service: "test-svc" });
    });
  });

  describe("env: development", () => {
    it("sets level to debug", () => {
      const logger = createLogger({
        service: "test-svc",
        env: "development",
      });
      expect(logger.level).toBe("debug");
    });

    it("sets base.service", () => {
      const logger = createLogger({
        service: "test-svc",
        env: "development",
      });
      expect(logger.bindings()).toMatchObject({ service: "test-svc" });
    });
  });

  describe("env: production", () => {
    it("sets level to info", () => {
      const logger = createLogger({
        service: "test-svc",
        env: "production",
      });
      expect(logger.level).toBe("info");
    });

    it("sets base.service", () => {
      const logger = createLogger({
        service: "test-svc",
        env: "production",
      });
      expect(logger.bindings()).toMatchObject({ service: "test-svc" });
    });
  });

  describe("env fallback to process.env.NODE_ENV", () => {
    const originalEnv = process.env["NODE_ENV"];

    afterEach(() => {
      if (originalEnv === undefined) {
        delete process.env["NODE_ENV"];
      } else {
        process.env["NODE_ENV"] = originalEnv;
      }
    });

    it("uses process.env.NODE_ENV when env is not provided", () => {
      process.env["NODE_ENV"] = "test";
      const logger = createLogger({ service: "test-svc" });
      expect(logger.level).toBe("silent");
    });

    it("falls back to production behavior when NODE_ENV is undefined", () => {
      delete process.env["NODE_ENV"];
      const logger = createLogger({ service: "test-svc" });
      expect(logger.level).toBe("info");
    });
  });
});
