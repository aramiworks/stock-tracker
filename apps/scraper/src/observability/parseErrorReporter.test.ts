import { describe, expect, it, jest } from "@jest/globals";
import type { PrismaClient } from "@stock-tracker/prisma";
import type { Logger } from "@stock-tracker/config";
import { reportParseError } from "./parseErrorReporter.js";

function fakeLogger(): Logger {
  return {
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
  } as unknown as Logger;
}

function fakePrisma(create: jest.Mock): PrismaClient {
  return {
    parse_errors: { create },
  } as unknown as PrismaClient;
}

describe("reportParseError", () => {
  it("inserts a parse_errors row and emits a structured log", async () => {
    const create = jest.fn(async () => ({})) as unknown as jest.Mock;
    const logger = fakeLogger();

    await reportParseError(
      { prisma: fakePrisma(create), logger },
      {
        brand: "Cartier",
        skuId: "sku-1",
        sourceUrl: "https://example.com/sku-1",
        error: new Error("missing add-button"),
        rawPayload: { status: 200, body: "<html/>" },
      },
    );

    expect(create).toHaveBeenCalledWith({
      data: {
        sku_id: "sku-1",
        brand: "Cartier",
        source_url: "https://example.com/sku-1",
        error_msg: "missing add-button",
        raw_payload: { status: 200, body: "<html/>" },
      },
    });
    expect(logger.error).toHaveBeenCalledWith(
      expect.objectContaining({ event: "scraper.parse_error" }),
      expect.stringContaining("Cartier"),
    );
  });

  it("wraps string payloads so Prisma's Json column stays queryable", async () => {
    const create = jest.fn(async () => ({})) as unknown as jest.Mock;
    await reportParseError(
      { prisma: fakePrisma(create), logger: fakeLogger() },
      {
        brand: "Hermes",
        skuId: "sku-2",
        sourceUrl: "https://example.com/sku-2",
        error: "raw-string-failure",
        rawPayload: "<html><body>blocked</body></html>",
      },
    );
    const call = create.mock.calls[0]?.[0] as {
      data: { raw_payload: unknown; error_msg: string };
    };
    expect(call.data.raw_payload).toEqual({
      kind: "text",
      body: "<html><body>blocked</body></html>",
    });
    expect(call.data.error_msg).toBe("raw-string-failure");
  });

  it("logs but does not throw when the parse_errors insert fails", async () => {
    const create = jest.fn(async () => {
      throw new Error("db down");
    }) as unknown as jest.Mock;
    const logger = fakeLogger();

    await expect(
      reportParseError(
        { prisma: fakePrisma(create), logger },
        {
          brand: "Cartier",
          skuId: "sku-3",
          sourceUrl: "https://example.com/sku-3",
          error: new Error("status 502"),
          rawPayload: undefined,
        },
      ),
    ).resolves.toBeUndefined();

    expect(logger.error).toHaveBeenCalledWith(
      expect.objectContaining({
        event: "scraper.parse_error_persist_failed",
      }),
      expect.any(String),
    );
  });
});
