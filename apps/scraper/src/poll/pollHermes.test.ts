import { describe, expect, it, jest } from "@jest/globals";
import type {
  BrandAdapter,
  RawResponse,
  StockState,
} from "../brands/BrandAdapter.js";
import type { Fetcher } from "../fetch/Fetcher.js";
import type { StateBuffer } from "../state/StateBuffer.js";
import {
  pollHermes,
  pollHermesSku,
  type IngestClient,
  type PollSkuDeps,
} from "./pollHermes.js";

/**
 * The real Hermès parser is still a stub (throws "not implemented" until its
 * fixtures land). To exercise transition semantics we inject a stub adapter that
 * serializes/deserializes StockState as JSON; the catalog test below uses the
 * real adapter to confirm the error path until the parser ships.
 */
const stubAdapter: BrandAdapter = {
  brand: "Hermes",
  buildUrl: (sku) =>
    `https://www.hermes.com/kr/ko/product/${sku.referenceCode}/`,
  fetch: (url, fetcher) => fetcher.get(url, { proxy: undefined as never }),
  parse: (raw) => JSON.parse(raw.body) as StockState,
};

const state = (body: string): RawResponse => ({
  status: 200,
  body,
  headers: { "content-type": "text/html" },
});

const outOfStock = state(JSON.stringify({ inStock: false, raw: null }));
const inStock = state(
  JSON.stringify({ inStock: true, price: 12500000, raw: null }),
);

/** Fetcher returning queued responses (or throwing queued errors) in order. */
function scriptedFetcher(steps: Array<RawResponse | Error>): Fetcher {
  let i = 0;
  return {
    get: async () => {
      const step = steps[Math.min(i, steps.length - 1)]!;
      i += 1;
      if (step instanceof Error) throw step;
      return step;
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

const sku = { id: "sku-1", referenceCode: "H012345" };

describe("pollHermesSku", () => {
  it("records an out-of-stock SKU without a transition", async () => {
    const deps: PollSkuDeps = {
      fetcher: scriptedFetcher([outOfStock]),
      stateBuffer: memoryStateBuffer(),
    };
    const r = await pollHermesSku(deps, stubAdapter, sku);
    expect(r.inStock).toBe(false);
    expect(r.transitioned).toBe(false);
    expect(r.dropEventEmitted).toBe(false);
    expect(r.url).toContain("H012345");
  });

  it("flags a transition on first in-stock sighting", async () => {
    const deps: PollSkuDeps = {
      fetcher: scriptedFetcher([inStock]),
      stateBuffer: memoryStateBuffer(),
    };
    const r = await pollHermesSku(deps, stubAdapter, sku);
    expect(r.inStock).toBe(true);
    expect(r.price).toBe(12500000);
    expect(r.transitioned).toBe(true);
    // No ingest client wired -> recorded but not emitted.
    expect(r.dropEventEmitted).toBe(false);
  });

  it("detects an out->in transition across two checks", async () => {
    const stateBuffer = memoryStateBuffer();
    const fetcher = scriptedFetcher([outOfStock, inStock]);
    const first = await pollHermesSku(
      { fetcher, stateBuffer },
      stubAdapter,
      sku,
    );
    const second = await pollHermesSku(
      { fetcher, stateBuffer },
      stubAdapter,
      sku,
    );
    expect(first.transitioned).toBe(false);
    expect(second.transitioned).toBe(true);
  });

  it("emits a drop event via the ingest client on transition", async () => {
    const upsert = jest
      .fn<IngestClient["tracker"]["ingest"]["dropEvent"]["upsert"]>()
      .mockResolvedValue({ dropEventId: "de-1", alertsCreated: 2 });
    const ingest: IngestClient = {
      tracker: { ingest: { dropEvent: { upsert } } },
    };
    const r = await pollHermesSku(
      {
        fetcher: scriptedFetcher([inStock]),
        stateBuffer: memoryStateBuffer(),
        ingest,
        now: () => new Date("2026-06-01T00:00:00.000Z"),
      },
      stubAdapter,
      sku,
    );
    expect(r.dropEventEmitted).toBe(true);
    expect(upsert).toHaveBeenCalledTimes(1);
    const arg = upsert.mock.calls[0]![0];
    expect(arg.skuId).toBe("sku-1");
    expect(arg.sourceUrl).toContain("H012345");
    expect(arg.idempotencyKey).toMatch(/^[a-f0-9]{64}$/);
  });

  it("captures fetch/parse errors and records an error", async () => {
    const stateBuffer = memoryStateBuffer();
    const recordError = jest.spyOn(stateBuffer, "recordError");
    const r = await pollHermesSku(
      { fetcher: scriptedFetcher([new Error("blocked")]), stateBuffer },
      stubAdapter,
      sku,
    );
    expect(r.inStock).toBeNull();
    expect(r.error).toContain("blocked");
    expect(r.transitioned).toBe(false);
    expect(recordError).toHaveBeenCalledWith("sku-1");
  });
});

describe("pollHermes", () => {
  it("drives every active Hermès SKU from the catalog", async () => {
    const prisma = {
      skus: {
        findMany: jest
          .fn<() => Promise<Array<{ id: string; reference_code: string }>>>()
          .mockResolvedValue([
            { id: "a", reference_code: "H012345" },
            { id: "b", reference_code: "H067890" },
          ]),
      },
    } as unknown as Parameters<typeof pollHermes>[0]["prisma"];

    // Real HermesAdapter parser is a stub today -> every SKU records an error.
    const results = await pollHermes({
      prisma,
      fetcher: scriptedFetcher([state("<html>ignored</html>")]),
      stateBuffer: memoryStateBuffer(),
    });

    expect(results).toHaveLength(2);
    expect(results.map((r) => r.referenceCode)).toEqual(["H012345", "H067890"]);
    expect(results.every((r) => r.inStock === null && r.error)).toBe(true);
  });
});
