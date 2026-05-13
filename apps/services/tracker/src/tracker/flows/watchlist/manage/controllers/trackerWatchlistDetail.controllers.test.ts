import { describe, expect, it, jest } from "@jest/globals";
import { TRPCError } from "@trpc/server";
import { TrackerWatchlistManageControllers } from "./trackerWatchlistManage.controllers.js";
import type { TrackerWatchlistManageModels } from "../models/trackerWatchlistManage.models.js";

const fixedDate = new Date("2025-05-01T12:00:00Z");

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

const baseSku: SkuRow = {
  id: "sku-1",
  color: "Noir",
  leather: "Togo",
  hardware: "GHW",
  size: "25",
  reference_code: "REF-1",
  image_url: "https://cdn.example/sku-1.jpg",
  active: true,
  sku_stock_state: {
    in_stock: true,
    last_checked: fixedDate,
  },
};

const baseWatch = {
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
    skus: [baseSku],
  },
};

function createControllers(opts: {
  watch?: typeof baseWatch | null;
  dropEvents?: { id: string; sku_id: string; source_url: string | null; detected_at: Date }[];
}) {
  const models = {
    findUnitWatch: jest.fn(async () => opts.watch ?? null),
    findDropEventsForUnit: jest.fn(async () => opts.dropEvents ?? []),
    createUnitWatch: jest.fn(async () => opts.watch),
    reactivateUnitWatch: jest.fn(async () => opts.watch),
    deleteUnitWatch: jest.fn(async () => 1),
  } as unknown as TrackerWatchlistManageModels;
  return { controllers: new TrackerWatchlistManageControllers(models), models };
}

describe("TrackerWatchlistManageControllers.detail", () => {
  it("composes entry + skus + dropEvents", async () => {
    const drop = {
      id: "d-1",
      sku_id: "sku-1",
      source_url: "https://hermes.co.kr/p/birkin-25",
      detected_at: new Date("2025-05-01T08:00:00Z"),
    };
    const { controllers } = createControllers({
      watch: baseWatch,
      dropEvents: [drop],
    });

    const result = await controllers.detail(
      { watchableUnitId: "wu-1" },
      "u-1",
    );

    expect(result.entry).toMatchObject({
      id: "w-1",
      watchableUnitId: "wu-1",
      brand: "Hermes",
      productLine: "Birkin",
      modelName: "Birkin 25",
      state: "in_stock",
      lastRestockedAt: drop.detected_at,
    });
    expect(result.skus).toEqual([
      {
        id: "sku-1",
        color: "Noir",
        leather: "Togo",
        hardware: "GHW",
        size: "25",
        referenceCode: "REF-1",
        imageUrl: "https://cdn.example/sku-1.jpg",
        inStock: true,
        lastChecked: fixedDate,
      },
    ]);
    expect(result.dropEvents).toEqual([
      {
        id: "d-1",
        skuId: "sku-1",
        sourceUrl: "https://hermes.co.kr/p/birkin-25",
        detectedAt: drop.detected_at,
      },
    ]);
  });

  it("throws NOT_FOUND when the user has no watch for this unit", async () => {
    const { controllers } = createControllers({ watch: null });

    await expect(
      controllers.detail({ watchableUnitId: "wu-1" }, "u-1"),
    ).rejects.toThrow(TRPCError);
    await expect(
      controllers.detail({ watchableUnitId: "wu-1" }, "u-1"),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  it("returns lastRestockedAt=null and empty dropEvents when none exist", async () => {
    const { controllers } = createControllers({
      watch: baseWatch,
      dropEvents: [],
    });

    const result = await controllers.detail(
      { watchableUnitId: "wu-1" },
      "u-1",
    );
    expect(result.entry.lastRestockedAt).toBeNull();
    expect(result.dropEvents).toEqual([]);
  });

  it("maps SKUs with null sku_stock_state to inStock=null/lastChecked=null", async () => {
    const watchNoState = {
      ...baseWatch,
      watchable_unit: {
        ...baseWatch.watchable_unit,
        skus: [{ ...baseSku, sku_stock_state: null }],
      },
    };
    const { controllers } = createControllers({ watch: watchNoState });
    const result = await controllers.detail(
      { watchableUnitId: "wu-1" },
      "u-1",
    );
    expect(result.skus[0]!.inStock).toBeNull();
    expect(result.skus[0]!.lastChecked).toBeNull();
  });
});

describe("TrackerWatchlistManageControllers.add", () => {
  it("creates a new watch when none exists", async () => {
    const models = {
      findUnitWatch: jest.fn(async () => null),
      createUnitWatch: jest.fn(async () => baseWatch),
      reactivateUnitWatch: jest.fn(),
      findDropEventsForUnit: jest.fn(async () => []),
    } as unknown as TrackerWatchlistManageModels;
    const controllers = new TrackerWatchlistManageControllers(models);

    const result = await controllers.add({ watchableUnitId: "wu-1" }, "u-1");

    expect(models.createUnitWatch).toHaveBeenCalledWith("u-1", "wu-1");
    expect(models.reactivateUnitWatch).not.toHaveBeenCalled();
    expect(result.watchableUnitId).toBe("wu-1");
  });

  it("is idempotent: returns existing watch without recreating", async () => {
    const models = {
      findUnitWatch: jest.fn(async () => baseWatch),
      createUnitWatch: jest.fn(),
      reactivateUnitWatch: jest.fn(),
      findDropEventsForUnit: jest.fn(async () => []),
    } as unknown as TrackerWatchlistManageModels;
    const controllers = new TrackerWatchlistManageControllers(models);

    const result = await controllers.add({ watchableUnitId: "wu-1" }, "u-1");

    expect(models.createUnitWatch).not.toHaveBeenCalled();
    expect(models.reactivateUnitWatch).not.toHaveBeenCalled();
    expect(result.id).toBe("w-1");
  });

  it("reactivates a soft-deactivated watch when active=false", async () => {
    const deactivated = { ...baseWatch, active: false };
    const reactivated = { ...baseWatch, active: true };
    const models = {
      findUnitWatch: jest.fn(async () => deactivated),
      createUnitWatch: jest.fn(),
      reactivateUnitWatch: jest.fn(async () => reactivated),
      findDropEventsForUnit: jest.fn(async () => []),
    } as unknown as TrackerWatchlistManageModels;
    const controllers = new TrackerWatchlistManageControllers(models);

    await controllers.add({ watchableUnitId: "wu-1" }, "u-1");

    expect(models.reactivateUnitWatch).toHaveBeenCalledWith("w-1");
    expect(models.createUnitWatch).not.toHaveBeenCalled();
  });
});

describe("TrackerWatchlistManageControllers.remove", () => {
  it("returns { removed: true } when a row was deleted", async () => {
    const models = {
      deleteUnitWatch: jest.fn(async () => 1),
    } as unknown as TrackerWatchlistManageModels;
    const controllers = new TrackerWatchlistManageControllers(models);

    const result = await controllers.remove(
      { watchableUnitId: "wu-1" },
      "u-1",
    );
    expect(result).toEqual({ removed: true });
    expect(models.deleteUnitWatch).toHaveBeenCalledWith("u-1", "wu-1");
  });

  it("returns { removed: false } when no row matched (idempotent)", async () => {
    const models = {
      deleteUnitWatch: jest.fn(async () => 0),
    } as unknown as TrackerWatchlistManageModels;
    const controllers = new TrackerWatchlistManageControllers(models);

    const result = await controllers.remove(
      { watchableUnitId: "wu-1" },
      "u-1",
    );
    expect(result).toEqual({ removed: false });
  });
});
