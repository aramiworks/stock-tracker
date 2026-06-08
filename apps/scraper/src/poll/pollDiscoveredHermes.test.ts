import { describe, expect, it, beforeEach } from "@jest/globals";
import type { PrismaClient } from "@stock-tracker/prisma";
import type { Fetcher } from "../fetch/Fetcher.js";
import type { RawResponse } from "../brands/BrandAdapter.js";
import { pollDiscoveredHermes } from "./pollDiscoveredHermes.js";

interface Row {
  id: string;
  brand: string;
  url: string;
  is_stale: boolean;
  in_stock: boolean | null;
  last_checked_at: Date | null;
  last_changed_at: Date | null;
}

/** In-memory stand-in for the prisma.discovered_products delegate. */
class FakeDiscoveredProducts {
  rows: Row[] = [];

  seed(row: Partial<Row> & { id: string; url: string }) {
    this.rows.push({
      brand: "Hermes",
      is_stale: false,
      in_stock: null,
      last_checked_at: null,
      last_changed_at: null,
      ...row,
    });
  }

  findMany = async ({
    where,
  }: {
    where: { brand: string; is_stale: boolean };
  }) =>
    this.rows
      .filter((r) => r.brand === where.brand && r.is_stale === where.is_stale)
      .map((r) => ({ id: r.id, url: r.url, in_stock: r.in_stock }));

  update = async ({
    where,
    data,
  }: {
    where: { id: string };
    data: Partial<Row>;
  }) => {
    const row = this.rows.find((r) => r.id === where.id)!;
    Object.assign(row, data);
    return row;
  };
}

function fakePrisma(dp: FakeDiscoveredProducts): PrismaClient {
  return { discovered_products: dp } as unknown as PrismaClient;
}

/** Fetcher that returns a response chosen by URL. */
function urlFetcher(map: Record<string, RawResponse>): Fetcher {
  return {
    get: async (url) => map[url] ?? { status: 404, body: "", headers: {} },
  };
}

const ld = (avail: string): RawResponse => ({
  status: 200,
  body: `<script type="application/ld+json">{"offers":{"availability":"http://schema.org/${avail}"}}</script>`,
  headers: {},
});
const IN = ld("InStock");
const OUT = ld("OutOfStock");
const BLOCKED: RawResponse = {
  status: 403,
  body: "<html>var dd={'t':'fe'}</html>",
  headers: {},
};

const NOW = new Date("2026-06-05T12:00:00.000Z");
const now = () => NOW;

describe("pollDiscoveredHermes", () => {
  let dp: FakeDiscoveredProducts;

  beforeEach(() => {
    dp = new FakeDiscoveredProducts();
  });

  it("records in/out stock and tallies the summary", async () => {
    dp.seed({ id: "a", url: "https://h/a" });
    dp.seed({ id: "b", url: "https://h/b" });
    const fetcher = urlFetcher({ "https://h/a": IN, "https://h/b": OUT });

    const summary = await pollDiscoveredHermes({
      prisma: fakePrisma(dp),
      fetcher,
      now,
    });

    expect(summary).toEqual({
      checked: 2,
      inStock: 1,
      outStock: 1,
      transitions: 1, // "a": null -> in-stock
      errors: 0,
    });
    const a = dp.rows.find((r) => r.id === "a")!;
    expect(a.in_stock).toBe(true);
    expect(a.last_checked_at).toEqual(NOW);
    expect(a.last_changed_at).toEqual(NOW);
  });

  it("sets last_changed_at only when in_stock flips", async () => {
    dp.seed({ id: "a", url: "https://h/a", in_stock: true }); // already in stock
    const fetcher = urlFetcher({ "https://h/a": IN });

    const summary = await pollDiscoveredHermes({
      prisma: fakePrisma(dp),
      fetcher,
      now,
    });

    expect(summary.transitions).toBe(0);
    const a = dp.rows.find((r) => r.id === "a")!;
    expect(a.last_checked_at).toEqual(NOW);
    expect(a.last_changed_at).toBeNull(); // unchanged -> not stamped
  });

  it("counts out->in as a transition", async () => {
    dp.seed({ id: "a", url: "https://h/a", in_stock: false });
    const fetcher = urlFetcher({ "https://h/a": IN });

    const summary = await pollDiscoveredHermes({
      prisma: fakePrisma(dp),
      fetcher,
      now,
    });

    expect(summary.transitions).toBe(1);
    expect(dp.rows.find((r) => r.id === "a")!.last_changed_at).toEqual(NOW);
  });

  it("leaves in_stock untouched on a blocked/non-200 page and counts an error", async () => {
    dp.seed({ id: "a", url: "https://h/a", in_stock: true });
    const fetcher = urlFetcher({ "https://h/a": BLOCKED });

    const summary = await pollDiscoveredHermes({
      prisma: fakePrisma(dp),
      fetcher,
      now,
    });

    expect(summary).toMatchObject({
      checked: 1,
      errors: 1,
      inStock: 0,
      outStock: 0,
    });
    const a = dp.rows.find((r) => r.id === "a")!;
    expect(a.in_stock).toBe(true); // NOT flipped to false by a block
    expect(a.last_checked_at).toBeNull(); // no successful resolve
  });

  it("excludes stale rows from the sweep", async () => {
    dp.seed({ id: "live", url: "https://h/live" });
    dp.seed({ id: "stale", url: "https://h/stale", is_stale: true });
    const fetcher = urlFetcher({
      "https://h/live": IN,
      "https://h/stale": IN,
    });

    const summary = await pollDiscoveredHermes({
      prisma: fakePrisma(dp),
      fetcher,
      now,
    });

    expect(summary.checked).toBe(1);
    expect(dp.rows.find((r) => r.id === "stale")!.in_stock).toBeNull();
  });
});
