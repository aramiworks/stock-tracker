import { describe, expect, it, jest } from "@jest/globals";
import { TrackerAlertHistoryBrowseControllers } from "./trackerAlertHistoryBrowse.controllers.js";
import type { TrackerAlertHistoryBrowseModels } from "../models/trackerAlertHistoryBrowse.models.js";

type DropEventRow = {
  id: string;
  sku_id: string;
  source_url: string | null;
  detected_at: Date;
  expired_at: Date | null;
  idempotency_key: string | null;
  sku: {
    id: string;
    color: string;
    leather: string | null;
    hardware: string | null;
    size: string | null;
    watchable_unit: {
      id: string;
      brand: string;
      product_line: string;
      model_name: string;
    };
  };
};

const D = (iso: string) => new Date(iso);

function makeEvent(overrides: Partial<DropEventRow> = {}): DropEventRow {
  return {
    id: "d-1",
    sku_id: "sku-1",
    source_url: null,
    detected_at: D("2025-05-01T12:00:00Z"),
    expired_at: null,
    idempotency_key: null,
    sku: {
      id: "sku-1",
      color: "Noir",
      leather: "Togo",
      hardware: "GHW",
      size: "25",
      watchable_unit: {
        id: "wu-1",
        brand: "Hermes",
        product_line: "Birkin",
        model_name: "Birkin 25",
      },
    },
    ...overrides,
  };
}

function createControllers(events: DropEventRow[]) {
  const models = {
    findForUser: jest.fn(async () => events),
  } as unknown as TrackerAlertHistoryBrowseModels;
  return {
    controllers: new TrackerAlertHistoryBrowseControllers(models),
    models,
  };
}

describe("TrackerAlertHistoryBrowseControllers.list — mapping", () => {
  it("maps each row to the AlertHistoryEvent shape", async () => {
    const { controllers } = createControllers([makeEvent()]);

    const result = await controllers.list({ limit: 20 }, "u-1");

    expect(result.events).toHaveLength(1);
    expect(result.events[0]).toEqual({
      id: "d-1",
      brand: "Hermes",
      productLine: "Birkin",
      modelName: "Birkin 25",
      skuDescriptor: "Noir · Togo · GHW · 25",
      kind: "restocked",
      detectedAt: D("2025-05-01T12:00:00Z"),
    });
  });

  it("composes skuDescriptor by joining non-null SKU parts with ' · '", async () => {
    const { controllers } = createControllers([
      makeEvent({
        sku: {
          id: "sku-1",
          color: "Etoupe",
          leather: null,
          hardware: "PHW",
          size: null,
          watchable_unit: {
            id: "wu-1",
            brand: "Hermes",
            product_line: "Kelly",
            model_name: "Kelly 28",
          },
        },
      }),
    ]);

    const result = await controllers.list({ limit: 20 }, "u-1");

    expect(result.events[0]!.skuDescriptor).toBe("Etoupe · PHW");
  });

  it("returns skuDescriptor as just the color when all other parts are null", async () => {
    const { controllers } = createControllers([
      makeEvent({
        sku: {
          id: "sku-1",
          color: "Gold",
          leather: null,
          hardware: null,
          size: null,
          watchable_unit: {
            id: "wu-1",
            brand: "Hermes",
            product_line: "Birkin",
            model_name: "Birkin 30",
          },
        },
      }),
    ]);

    const result = await controllers.list({ limit: 20 }, "u-1");

    expect(result.events[0]!.skuDescriptor).toBe("Gold");
  });

  it("always emits kind='restocked' (Option A — soldOut deferred)", async () => {
    const { controllers } = createControllers([makeEvent(), makeEvent()]);

    const result = await controllers.list({ limit: 20 }, "u-1");

    expect(result.events.every((e) => e.kind === "restocked")).toBe(true);
  });
});

describe("TrackerAlertHistoryBrowseControllers.list — pagination", () => {
  it("returns nextCursor=null when fewer rows than limit are returned", async () => {
    const events = [
      makeEvent({ id: "d-1", detected_at: D("2025-05-01T00:00:00Z") }),
      makeEvent({ id: "d-2", detected_at: D("2025-04-30T00:00:00Z") }),
    ];
    const { controllers } = createControllers(events);

    const result = await controllers.list({ limit: 20 }, "u-1");

    expect(result.events).toHaveLength(2);
    expect(result.nextCursor).toBeNull();
  });

  it("returns nextCursor=null when row count equals limit exactly", async () => {
    const events = [
      makeEvent({ id: "d-1", detected_at: D("2025-05-01T00:00:00Z") }),
      makeEvent({ id: "d-2", detected_at: D("2025-04-30T00:00:00Z") }),
    ];
    const { controllers } = createControllers(events);

    const result = await controllers.list({ limit: 2 }, "u-1");

    expect(result.events).toHaveLength(2);
    expect(result.nextCursor).toBeNull();
  });

  it("returns nextCursor as the ISO of the last visible row when an extra row was peeked", async () => {
    // Model returns limit+1 (3) rows; controller trims to 2 and emits cursor
    // from the 2nd row's detected_at.
    const events = [
      makeEvent({ id: "d-1", detected_at: D("2025-05-03T00:00:00Z") }),
      makeEvent({ id: "d-2", detected_at: D("2025-05-02T00:00:00Z") }),
      makeEvent({ id: "d-3", detected_at: D("2025-05-01T00:00:00Z") }),
    ];
    const { controllers } = createControllers(events);

    const result = await controllers.list({ limit: 2 }, "u-1");

    expect(result.events).toHaveLength(2);
    expect(result.events.map((e) => e.id)).toEqual(["d-1", "d-2"]);
    expect(result.nextCursor).toBe("2025-05-02T00:00:00.000Z");
  });

  it("returns an empty page with null cursor when no events exist", async () => {
    const { controllers } = createControllers([]);

    const result = await controllers.list({ limit: 20 }, "u-1");

    expect(result.events).toEqual([]);
    expect(result.nextCursor).toBeNull();
  });

  it("forwards the cursor as a Date to the model when provided", async () => {
    const { controllers, models } = createControllers([]);

    await controllers.list(
      { limit: 20, cursor: "2025-05-01T00:00:00.000Z" },
      "u-1",
    );

    expect(models.findForUser).toHaveBeenCalledWith({
      userId: "u-1",
      limit: 20,
      cursor: D("2025-05-01T00:00:00.000Z"),
    });
  });

  it("forwards a null cursor to the model when the input cursor is absent", async () => {
    const { controllers, models } = createControllers([]);

    await controllers.list({ limit: 20 }, "u-1");

    expect(models.findForUser).toHaveBeenCalledWith({
      userId: "u-1",
      limit: 20,
      cursor: null,
    });
  });

  it("forwards a null cursor to the model when the input cursor is explicitly null", async () => {
    const { controllers, models } = createControllers([]);

    await controllers.list({ limit: 20, cursor: null }, "u-1");

    expect(models.findForUser).toHaveBeenCalledWith({
      userId: "u-1",
      limit: 20,
      cursor: null,
    });
  });
});
