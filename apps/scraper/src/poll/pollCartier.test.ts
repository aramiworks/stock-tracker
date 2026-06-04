import { describe, expect, it, jest } from "@jest/globals";
import type { RawResponse } from "../brands/BrandAdapter.js";
import type { Fetcher } from "../fetch/Fetcher.js";
import type { StateBuffer } from "../state/StateBuffer.js";
import { getBrandAdapter } from "../brands/registry.js";
import {
  IN_STOCK_HTML,
  OUT_OF_STOCK_HTML,
} from "../brands/cartier/fixtures.js";
import {
  pollCartier,
  pollCartierSku,
  type IngestClient,
  type PollSkuDeps,
} from "./pollCartier.js";

const adapter = getBrandAdapter("Cartier");

const ok = (body: string): RawResponse => ({
  status: 200,
  body,
  headers: { "content-type": "text/html" },
});

/** Fetcher returning queued responses (or throwing queued errors) in order. */
function scriptedFetcher(steps: Array<RawResponse | Error>): Fetcher {
  let i = 0;
  return {
    get: async () => {
      const step = steps[Math.min(i, steps.length - 1)];
      i += 1;
      if (step instanceof Error) throw step;
      return step as RawResponse;
    },
  };
}

/** In-memory StateBuffer mirroring PrismaStateBuffer's transition semantics. */
function memoryStateBuffer(): StateBuffer {
  const states = new Map<string, { inStock: boolean; errors: number }>();
  return {
    async read(skuId) {
      const s = states.get(skuId);
      return {
        inStock: s ? s.inStock : null,
        consecutiveErrors: s?.errors ?? 0,
      };
    },
    async recordCheck(skuId, current) {
      const prior = states.get(skuId)?.inStock ?? null;
      const transitioned =
        (prior === null || prior === false) && current.inStock;
      states.set(skuId, { inStock: current.inStock, errors: 0 });
      return { transitioned };
    },
    async recordError(skuId) {
      const errors = (states.get(skuId)?.errors ?? 0) + 1;
      states.set(skuId, {
        inStock: states.get(skuId)?.inStock ?? false,
        errors,
      });
      return { consecutiveErrors: errors };
    },
  };
}

const sku = { id: "sku-1", referenceCode: "WSTA0106" };

describe("pollCartierSku", () => {
  it("records an out-of-stock SKU without a transition", async () => {
    const deps: PollSkuDeps = {
      fetcher: scriptedFetcher([ok(OUT_OF_STOCK_HTML)]),
      stateBuffer: memoryStateBuffer(),
    };
    const r = await pollCartierSku(deps, adapter, sku);
    expect(r.inStock).toBe(false);
    expect(r.price).toBe(6800000);
    expect(r.transitioned).toBe(false);
    expect(r.dropEventEmitted).toBe(false);
    expect(r.url).toContain("CRWSTA0106");
  });

  it("flags a transition on first in-stock sighting", async () => {
    const deps: PollSkuDeps = {
      fetcher: scriptedFetcher([ok(IN_STOCK_HTML)]),
      stateBuffer: memoryStateBuffer(),
    };
    const r = await pollCartierSku(deps, adapter, sku);
    expect(r.inStock).toBe(true);
    expect(r.transitioned).toBe(true);
    // No ingest client wired -> recorded but not emitted.
    expect(r.dropEventEmitted).toBe(false);
  });

  it("detects an out->in transition across two checks", async () => {
    const stateBuffer = memoryStateBuffer();
    const fetcher = scriptedFetcher([ok(OUT_OF_STOCK_HTML), ok(IN_STOCK_HTML)]);
    const first = await pollCartierSku({ fetcher, stateBuffer }, adapter, sku);
    const second = await pollCartierSku({ fetcher, stateBuffer }, adapter, sku);
    expect(first.transitioned).toBe(false);
    expect(second.transitioned).toBe(true);
  });

  it("emits a drop event via the ingest client on transition", async () => {
    const upsert = jest
      .fn<IngestClient["tracker"]["ingest"]["dropEvent"]["upsert"]>()
      .mockResolvedValue({ dropEventId: "de-1", alertsCreated: 3 });
    const ingest: IngestClient = {
      tracker: { ingest: { dropEvent: { upsert } } },
    };
    const r = await pollCartierSku(
      {
        fetcher: scriptedFetcher([ok(IN_STOCK_HTML)]),
        stateBuffer: memoryStateBuffer(),
        ingest,
        now: () => new Date("2026-06-01T00:00:00.000Z"),
      },
      adapter,
      sku,
    );
    expect(r.dropEventEmitted).toBe(true);
    expect(upsert).toHaveBeenCalledTimes(1);
    const arg = upsert.mock.calls[0]![0];
    expect(arg.skuId).toBe("sku-1");
    expect(arg.sourceUrl).toContain("CRWSTA0106");
    expect(arg.idempotencyKey).toMatch(/^[a-f0-9]{64}$/);
  });

  it("captures fetch/parse errors and records an error", async () => {
    const stateBuffer = memoryStateBuffer();
    const recordError = jest.spyOn(stateBuffer, "recordError");
    const r = await pollCartierSku(
      { fetcher: scriptedFetcher([new Error("boom")]), stateBuffer },
      adapter,
      sku,
    );
    expect(r.inStock).toBeNull();
    expect(r.error).toContain("boom");
    expect(r.transitioned).toBe(false);
    expect(recordError).toHaveBeenCalledWith("sku-1");
  });
});

describe("pollCartierSku url source", () => {
  it("uses the stored source url verbatim when provided", async () => {
    const seen: string[] = [];
    const fetcher: Fetcher = {
      get: async (url) => {
        seen.push(url);
        return ok(OUT_OF_STOCK_HTML);
      },
    };
    const stored =
      "https://www.cartier.com/ko-kr/시계/컬렉션/산토스/x-CRWSSA0086.html";
    const r = await pollCartierSku(
      { fetcher, stateBuffer: memoryStateBuffer() },
      adapter,
      {
        id: "s",
        referenceCode: "WSSA0086",
        url: stored,
      },
    );
    expect(seen).toEqual([stored]);
    expect(r.url).toBe(stored);
  });
});

describe("pollCartier", () => {
  it("drives every active Cartier SKU and passes source_url through", async () => {
    const prisma = {
      skus: {
        findMany: jest
          .fn<
            () => Promise<
              Array<{
                id: string;
                reference_code: string;
                source_url: string | null;
              }>
            >
          >()
          .mockResolvedValue([
            { id: "a", reference_code: "WSTA0106", source_url: null },
            {
              id: "b",
              reference_code: "WSSA0086",
              source_url: "https://www.cartier.com/ko-kr/x-CRWSSA0086.html",
            },
          ]),
      },
    } as unknown as Parameters<typeof pollCartier>[0]["prisma"];

    const results = await pollCartier({
      prisma,
      fetcher: scriptedFetcher([ok(OUT_OF_STOCK_HTML)]),
      stateBuffer: memoryStateBuffer(),
    });

    expect(results).toHaveLength(2);
    // Tank Must falls back to the derived URL; the other uses its stored URL.
    expect(results[0]!.url).toContain(
      "tank-must-de-cartier-watch-CRWSTA0106.html",
    );
    expect(results[1]!.url).toBe(
      "https://www.cartier.com/ko-kr/x-CRWSSA0086.html",
    );
  });
});
