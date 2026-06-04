import { describe, expect, it, jest } from "@jest/globals";
import type { PrismaClient } from "@stock-tracker/prisma";
import type { Logger } from "@stock-tracker/config";
import { pageOnConsecutiveFailures } from "./slackPager.js";

interface StalledRow {
  sku_id: string;
  consecutive_errors: number;
  last_checked: Date;
  last_paged_at: Date | null;
  sku: { reference_code: string | null };
}

function fakeLogger(): Logger {
  return {
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
  } as unknown as Logger;
}

function fakePrisma(rows: StalledRow[], update: jest.Mock): PrismaClient {
  return {
    sku_stock_state: {
      findMany: jest.fn(async () => rows),
      update,
    },
  } as unknown as PrismaClient;
}

function okFetch(): typeof globalThis.fetch {
  return jest.fn(
    async () => ({ ok: true }) as Response,
  ) as unknown as typeof globalThis.fetch;
}

describe("pageOnConsecutiveFailures", () => {
  it("no-ops when no webhook URL is configured", async () => {
    const fetchMock = jest.fn() as unknown as typeof globalThis.fetch;
    const result = await pageOnConsecutiveFailures(
      {
        prisma: fakePrisma([], jest.fn()),
        logger: fakeLogger(),
        fetch: fetchMock,
      },
      "Cartier",
    );
    expect(result).toEqual({ paged: [], suppressed: [] });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("pages once per stalled SKU and stamps last_paged_at", async () => {
    const lastChecked = new Date("2026-06-04T10:00:00Z");
    const update = jest.fn(async () => ({})) as unknown as jest.Mock;
    const fetchMock = okFetch();

    const result = await pageOnConsecutiveFailures(
      {
        prisma: fakePrisma(
          [
            {
              sku_id: "sku-1",
              consecutive_errors: 5,
              last_checked: lastChecked,
              last_paged_at: null,
              sku: { reference_code: "ABC-123" },
            },
          ],
          update,
        ),
        logger: fakeLogger(),
        webhookUrl: "https://hooks.slack.com/services/test",
        fetch: fetchMock,
        now: () => new Date("2026-06-04T10:05:00Z"),
      },
      "Cartier",
    );

    expect(result.paged).toEqual(["sku-1"]);
    expect(result.suppressed).toEqual([]);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(update).toHaveBeenCalledWith({
      where: { sku_id: "sku-1" },
      data: { last_paged_at: new Date("2026-06-04T10:05:00Z") },
    });
  });

  it("suppresses pages inside the cooldown window", async () => {
    const now = new Date("2026-06-04T10:00:00Z");
    const recentlyPaged = new Date("2026-06-04T08:00:00Z"); // 2h ago
    const update = jest.fn(async () => ({})) as unknown as jest.Mock;
    const fetchMock = okFetch();

    const result = await pageOnConsecutiveFailures(
      {
        prisma: fakePrisma(
          [
            {
              sku_id: "sku-1",
              consecutive_errors: 10,
              last_checked: now,
              last_paged_at: recentlyPaged,
              sku: { reference_code: null },
            },
          ],
          update,
        ),
        logger: fakeLogger(),
        webhookUrl: "https://hooks.slack.com/services/test",
        fetch: fetchMock,
        cooldownMs: 6 * 60 * 60 * 1000,
        now: () => now,
      },
      "Hermes",
    );

    expect(result.paged).toEqual([]);
    expect(result.suppressed).toEqual(["sku-1"]);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(update).not.toHaveBeenCalled();
  });

  it("re-pages once the cooldown window has elapsed", async () => {
    const now = new Date("2026-06-04T18:00:00Z");
    const longAgo = new Date("2026-06-04T08:00:00Z"); // 10h ago
    const update = jest.fn(async () => ({})) as unknown as jest.Mock;
    const fetchMock = okFetch();

    const result = await pageOnConsecutiveFailures(
      {
        prisma: fakePrisma(
          [
            {
              sku_id: "sku-1",
              consecutive_errors: 12,
              last_checked: now,
              last_paged_at: longAgo,
              sku: { reference_code: "REF" },
            },
          ],
          update,
        ),
        logger: fakeLogger(),
        webhookUrl: "https://hooks.slack.com/services/test",
        fetch: fetchMock,
        cooldownMs: 6 * 60 * 60 * 1000,
        now: () => now,
      },
      "Hermes",
    );

    expect(result.paged).toEqual(["sku-1"]);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("skips the update when the Slack webhook responds non-2xx", async () => {
    const update = jest.fn(async () => ({})) as unknown as jest.Mock;
    const fetchMock = jest.fn(
      async () => ({ ok: false }) as Response,
    ) as unknown as typeof globalThis.fetch;

    const result = await pageOnConsecutiveFailures(
      {
        prisma: fakePrisma(
          [
            {
              sku_id: "sku-1",
              consecutive_errors: 5,
              last_checked: new Date(),
              last_paged_at: null,
              sku: { reference_code: null },
            },
          ],
          update,
        ),
        logger: fakeLogger(),
        webhookUrl: "https://hooks.slack.com/services/test",
        fetch: fetchMock,
      },
      "Cartier",
    );

    expect(result.paged).toEqual([]);
    expect(update).not.toHaveBeenCalled();
  });
});
