import { describe, expect, it, jest } from "@jest/globals";
import { TrackerWatchlistManageControllers } from "./trackerWatchlistManage.controllers.js";
import type { TrackerWatchlistManageModels } from "../models/trackerWatchlistManage.models.js";

type SkuRow = {
  id: string;
  color: string;
  leather: string | null;
  hardware: string | null;
  size: string | null;
  reference_code: string | null;
  image_url: string | null;
  active: boolean;
  sku_stock_state: { in_stock: boolean; last_checked: Date } | null;
};

type UnitWatchRow = {
  id: string;
  auth_user_id: string;
  watchable_unit_id: string;
  sku_id: null;
  notify_push: boolean;
  notify_email: boolean;
  active: boolean;
  created_at: Date;
  updated_at: Date;
  watchable_unit: {
    id: string;
    brand: string;
    product_line: string;
    model_name: string;
    image_url: string | null;
    skus: SkuRow[];
  };
};

const fixedDate = new Date("2025-05-01T12:00:00Z");

function makeSku(overrides: Partial<SkuRow> = {}): SkuRow {
  return {
    id: "sku-1",
    color: "Noir",
    leather: "Togo",
    hardware: "GHW",
    size: "25",
    reference_code: null,
    image_url: null,
    active: true,
    sku_stock_state: null,
    ...overrides,
  };
}

function makeUnitWatch(overrides: Partial<UnitWatchRow> = {}): UnitWatchRow {
  return {
    id: "w-1",
    auth_user_id: "u-1",
    watchable_unit_id: "wu-1",
    sku_id: null,
    notify_push: true,
    notify_email: true,
    active: true,
    created_at: fixedDate,
    updated_at: fixedDate,
    watchable_unit: {
      id: "wu-1",
      brand: "Hermes",
      product_line: "Birkin",
      model_name: "Birkin 25",
      image_url: null,
      skus: [makeSku()],
    },
    ...overrides,
  };
}

function createControllers(
  watches: UnitWatchRow[],
  dropEventsByUnit: Record<
    string,
    {
      id: string;
      sku_id: string;
      source_url: string | null;
      detected_at: Date;
    }[]
  > = {},
) {
  const models = {
    findAllUnitWatchesForUser: jest.fn(async () => watches),
    findDropEventsForUnit: jest.fn(async (unitId: string) => {
      return dropEventsByUnit[unitId] ?? [];
    }),
  } as unknown as TrackerWatchlistManageModels;
  return new TrackerWatchlistManageControllers(models);
}

describe("TrackerWatchlistManageControllers.listGrouped — grouping", () => {
  it("groups entries by (brand, productLine) preserving Prisma sort order", async () => {
    const watches: UnitWatchRow[] = [
      makeUnitWatch({
        id: "w-1",
        watchable_unit_id: "wu-1",
        watchable_unit: {
          id: "wu-1",
          brand: "Cartier",
          product_line: "Tank Must",
          model_name: "Tank Must Large",
          image_url: null,
          skus: [],
        },
      }),
      makeUnitWatch({
        id: "w-2",
        watchable_unit_id: "wu-2",
        watchable_unit: {
          id: "wu-2",
          brand: "Hermes",
          product_line: "Birkin",
          model_name: "Birkin 25",
          image_url: null,
          skus: [],
        },
      }),
      makeUnitWatch({
        id: "w-3",
        watchable_unit_id: "wu-3",
        watchable_unit: {
          id: "wu-3",
          brand: "Hermes",
          product_line: "Birkin",
          model_name: "Birkin 30",
          image_url: null,
          skus: [],
        },
      }),
      makeUnitWatch({
        id: "w-4",
        watchable_unit_id: "wu-4",
        watchable_unit: {
          id: "wu-4",
          brand: "Hermes",
          product_line: "Kelly",
          model_name: "Kelly 28",
          image_url: null,
          skus: [],
        },
      }),
    ];
    const controllers = createControllers(watches);

    const result = await controllers.listGrouped("u-1");

    expect(result).toHaveLength(3);
    expect(result.map((g) => `${g.brand}|${g.productLine}`)).toEqual([
      "Cartier|Tank Must",
      "Hermes|Birkin",
      "Hermes|Kelly",
    ]);
    expect(result[1]!.entries.map((e) => e.modelName)).toEqual([
      "Birkin 25",
      "Birkin 30",
    ]);
  });

  it("returns empty array when user has no watches", async () => {
    const controllers = createControllers([]);
    const result = await controllers.listGrouped("u-1");
    expect(result).toEqual([]);
  });

  it("produces a single group when all entries share (brand, productLine)", async () => {
    const watches: UnitWatchRow[] = [
      makeUnitWatch({
        id: "w-1",
        watchable_unit_id: "wu-1",
        watchable_unit: {
          id: "wu-1",
          brand: "Hermes",
          product_line: "Birkin",
          model_name: "Birkin 25",
          image_url: null,
          skus: [],
        },
      }),
      makeUnitWatch({
        id: "w-2",
        watchable_unit_id: "wu-2",
        watchable_unit: {
          id: "wu-2",
          brand: "Hermes",
          product_line: "Birkin",
          model_name: "Birkin 30",
          image_url: null,
          skus: [],
        },
      }),
    ];
    const controllers = createControllers(watches);
    const result = await controllers.listGrouped("u-1");

    expect(result).toHaveLength(1);
    expect(result[0]!.entries).toHaveLength(2);
  });
});

describe("TrackerWatchlistManageControllers.listGrouped — state derivation", () => {
  it("returns state=unknown when no SKUs have stock state recorded", async () => {
    const watches: UnitWatchRow[] = [
      makeUnitWatch({
        watchable_unit: {
          id: "wu-1",
          brand: "Hermes",
          product_line: "Birkin",
          model_name: "Birkin 25",
          image_url: null,
          skus: [
            makeSku({ id: "sku-1", sku_stock_state: null }),
            makeSku({ id: "sku-2", sku_stock_state: null }),
          ],
        },
      }),
    ];
    const controllers = createControllers(watches);
    const result = await controllers.listGrouped("u-1");
    expect(result[0]!.entries[0]!.state).toBe("unknown");
  });

  it("returns state=in_stock when ANY SKU is in_stock=true", async () => {
    const watches: UnitWatchRow[] = [
      makeUnitWatch({
        watchable_unit: {
          id: "wu-1",
          brand: "Hermes",
          product_line: "Birkin",
          model_name: "Birkin 25",
          image_url: null,
          skus: [
            makeSku({
              id: "sku-1",
              sku_stock_state: { in_stock: false, last_checked: fixedDate },
            }),
            makeSku({
              id: "sku-2",
              sku_stock_state: { in_stock: true, last_checked: fixedDate },
            }),
          ],
        },
      }),
    ];
    const controllers = createControllers(watches);
    const result = await controllers.listGrouped("u-1");
    expect(result[0]!.entries[0]!.state).toBe("in_stock");
  });

  it("returns state=out_of_stock when ALL known SKU states are out_of_stock", async () => {
    const watches: UnitWatchRow[] = [
      makeUnitWatch({
        watchable_unit: {
          id: "wu-1",
          brand: "Hermes",
          product_line: "Birkin",
          model_name: "Birkin 25",
          image_url: null,
          skus: [
            makeSku({
              id: "sku-1",
              sku_stock_state: { in_stock: false, last_checked: fixedDate },
            }),
            makeSku({
              id: "sku-2",
              sku_stock_state: { in_stock: false, last_checked: fixedDate },
            }),
          ],
        },
      }),
    ];
    const controllers = createControllers(watches);
    const result = await controllers.listGrouped("u-1");
    expect(result[0]!.entries[0]!.state).toBe("out_of_stock");
  });

  it("returns state=unknown when SKU list is empty (active filter dropped all)", async () => {
    const watches: UnitWatchRow[] = [
      makeUnitWatch({
        watchable_unit: {
          id: "wu-1",
          brand: "Hermes",
          product_line: "Birkin",
          model_name: "Birkin 25",
          image_url: null,
          skus: [],
        },
      }),
    ];
    const controllers = createControllers(watches);
    const result = await controllers.listGrouped("u-1");
    expect(result[0]!.entries[0]!.state).toBe("unknown");
  });

  it("populates lastRestockedAt from the latest drop_event per unit", async () => {
    const oldDrop = new Date("2025-01-01T00:00:00Z");
    const newDrop = new Date("2025-05-01T00:00:00Z");

    const watches: UnitWatchRow[] = [
      makeUnitWatch({ id: "w-1", watchable_unit_id: "wu-1" }),
    ];
    const dropEvents = {
      "wu-1": [
        { id: "d-1", sku_id: "sku-1", source_url: null, detected_at: newDrop },
        { id: "d-2", sku_id: "sku-1", source_url: null, detected_at: oldDrop },
      ],
    };
    const controllers = createControllers(watches, dropEvents);
    const result = await controllers.listGrouped("u-1");

    // findDropEventsForUnit returns most-recent-first (Prisma orderBy desc),
    // so the controller picks index 0.
    expect(result[0]!.entries[0]!.lastRestockedAt).toEqual(newDrop);
  });

  it("lastRestockedAt is null when no drop events exist for the unit", async () => {
    const watches: UnitWatchRow[] = [makeUnitWatch()];
    const controllers = createControllers(watches);
    const result = await controllers.listGrouped("u-1");
    expect(result[0]!.entries[0]!.lastRestockedAt).toBeNull();
  });
});
