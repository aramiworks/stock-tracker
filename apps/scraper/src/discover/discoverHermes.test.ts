import { describe, expect, it, beforeEach, jest } from "@jest/globals";
import type { PrismaClient } from "@stock-tracker/prisma";
import type { Fetcher } from "../fetch/Fetcher.js";
import type { RawResponse } from "../brands/BrandAdapter.js";
import { discoverHermes, extractDiscoveredItems } from "./discoverHermes.js";

interface Row {
  brand: string;
  article_code: string;
  url: string;
  model_hint: string | null;
  first_seen_at: Date;
  last_seen_at: Date;
  is_stale: boolean;
}

/** In-memory stand-in for the prisma.discovered_products delegate. */
class FakeDiscoveredProducts {
  rows = new Map<string, Row>();
  upsertCalls: { article_code: string; url: string }[] = [];

  private key(brand: string, code: string) {
    return `${brand}:${code}`;
  }

  seed(row: Row) {
    this.rows.set(this.key(row.brand, row.article_code), row);
  }

  findUnique = async ({
    where,
  }: {
    where: { brand_article_code: { brand: string; article_code: string } };
  }) => {
    const { brand, article_code } = where.brand_article_code;
    return this.rows.get(this.key(brand, article_code)) ?? null;
  };

  upsert = async ({
    where,
    create,
    update,
  }: {
    where: { brand_article_code: { brand: string; article_code: string } };
    create: Row;
    update: Partial<Row>;
  }) => {
    const { brand, article_code } = where.brand_article_code;
    const k = this.key(brand, article_code);
    this.upsertCalls.push({ article_code, url: create.url });
    const existing = this.rows.get(k);
    if (existing) {
      this.rows.set(k, { ...existing, ...update });
    } else {
      this.rows.set(k, { ...create });
    }
    return this.rows.get(k)!;
  };

  updateMany = async ({
    where,
    data,
  }: {
    where: { brand: string; is_stale: boolean; last_seen_at: { lt: Date } };
    data: { is_stale: boolean };
  }) => {
    let count = 0;
    for (const row of this.rows.values()) {
      if (
        row.brand === where.brand &&
        row.is_stale === where.is_stale &&
        row.last_seen_at < where.last_seen_at.lt
      ) {
        row.is_stale = data.is_stale;
        count++;
      }
    }
    return { count };
  };
}

function fakePrisma(dp: FakeDiscoveredProducts): PrismaClient {
  return { discovered_products: dp } as unknown as PrismaClient;
}

function fixedFetcher(res: RawResponse): Fetcher {
  return { get: async () => res };
}

const html200 = (paths: string[]): RawResponse => ({
  status: 200,
  body: paths.map((p) => `<a href="${p}">card</a>`).join("\n"),
  headers: {},
});

const NOW = new Date("2026-06-05T18:00:00.000Z");
const now = () => NOW;

describe("extractDiscoveredItems", () => {
  it("extracts valid article codes and skips non-product trailing tokens", () => {
    const items = extractDiscoveredItems(
      [
        `<a href="/kr/ko/product/poche-cliquetis-백-H086915CK37/">x</a>`,
        `<a href="/kr/ko/product/mini-medor-백-H085003CK37/">x</a>`,
        `<a href="/kr/ko/product/some-category-page/">x</a>`, // "page" — invalid
      ].join(""),
    );
    const codes = items.map((i) => i.articleCode).sort();
    expect(codes).toEqual(["H085003CK37", "H086915CK37"]);
    const poche = items.find((i) => i.articleCode === "H086915CK37")!;
    expect(poche.url).toBe(
      "https://www.hermes.com/kr/ko/product/poche-cliquetis-백-H086915CK37/",
    );
    expect(poche.modelHint).toBe("poche-cliquetis-백");
  });

  it("dedupes repeated product cards to the first occurrence", () => {
    const items = extractDiscoveredItems(
      [
        `<a href="/kr/ko/product/poche-cliquetis-백-H086915CK37/">x</a>`,
        `<a href="/kr/ko/product/poche-cliquetis-백-H086915CK37/">dup</a>`,
      ].join(""),
    );
    expect(items).toHaveLength(1);
  });
});

describe("discoverHermes", () => {
  let dp: FakeDiscoveredProducts;

  beforeEach(() => {
    dp = new FakeDiscoveredProducts();
  });

  it("upserts a row per discovered code and counts new creations", async () => {
    const fetcher = fixedFetcher(
      html200([
        "/kr/ko/product/poche-cliquetis-백-H086915CK37/",
        "/kr/ko/product/mini-medor-백-H085003CK37/",
      ]),
    );

    const summary = await discoverHermes({
      prisma: fakePrisma(dp),
      fetcher,
      now,
    });

    expect(summary).toMatchObject({
      swept: 1,
      discovered: 2,
      created: 2,
      stale: 0,
    });
    expect(dp.upsertCalls).toHaveLength(2);
    const row = dp.rows.get("Hermes:H086915CK37")!;
    expect(row.url).toContain("poche-cliquetis");
    expect(row.last_seen_at).toEqual(NOW);
    expect(row.is_stale).toBe(false);
  });

  it("counts a previously-stale row coming back as restocked and clears is_stale", async () => {
    dp.seed({
      brand: "Hermes",
      article_code: "H086915CK37",
      url: "old",
      model_hint: null,
      first_seen_at: new Date("2026-01-01"),
      last_seen_at: new Date("2026-01-01"),
      is_stale: true,
    });
    const fetcher = fixedFetcher(
      html200(["/kr/ko/product/poche-cliquetis-백-H086915CK37/"]),
    );

    const summary = await discoverHermes({
      prisma: fakePrisma(dp),
      fetcher,
      now,
    });

    expect(summary).toMatchObject({ created: 0, restocked: 1 });
    expect(dp.rows.get("Hermes:H086915CK37")!.is_stale).toBe(false);
  });

  it("flips rows not seen within the 14-day TTL to stale", async () => {
    // Seen 20 days ago, not in this sweep -> should go stale.
    dp.seed({
      brand: "Hermes",
      article_code: "H000000AA00",
      url: "old",
      model_hint: null,
      first_seen_at: new Date("2026-05-16T18:00:00.000Z"),
      last_seen_at: new Date("2026-05-16T18:00:00.000Z"),
      is_stale: false,
    });
    const fetcher = fixedFetcher(
      html200(["/kr/ko/product/poche-cliquetis-백-H086915CK37/"]),
    );

    const summary = await discoverHermes({
      prisma: fakePrisma(dp),
      fetcher,
      now,
    });

    expect(summary.stale).toBe(1);
    expect(dp.rows.get("Hermes:H000000AA00")!.is_stale).toBe(true);
    // The freshly-seen row stays fresh.
    expect(dp.rows.get("Hermes:H086915CK37")!.is_stale).toBe(false);
  });

  it("writes nothing and marks nothing stale when the page is blocked", async () => {
    dp.seed({
      brand: "Hermes",
      article_code: "H000000AA00",
      url: "old",
      model_hint: null,
      first_seen_at: new Date("2026-01-01"),
      last_seen_at: new Date("2026-01-01"), // ancient, but must NOT go stale
      is_stale: false,
    });
    const blocked: RawResponse = {
      status: 403,
      body: "<html>var dd={'t':'fe'}</html>",
      headers: {},
    };

    const summary = await discoverHermes({
      prisma: fakePrisma(dp),
      fetcher: fixedFetcher(blocked),
      now,
    });

    expect(summary).toMatchObject({ swept: 0, discovered: 0, stale: 0 });
    expect(dp.upsertCalls).toHaveLength(0);
    expect(dp.rows.get("Hermes:H000000AA00")!.is_stale).toBe(false);
  });

  it("continues past a fetch that throws without marking stale", async () => {
    const fetcher: Fetcher = {
      get: jest.fn<Fetcher["get"]>().mockRejectedValue(new Error("network")),
    };
    const summary = await discoverHermes({
      prisma: fakePrisma(dp),
      fetcher,
      now,
    });
    expect(summary).toMatchObject({
      swept: 0,
      discovered: 0,
      created: 0,
      stale: 0,
    });
  });
});
