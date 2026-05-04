import { describe, expect, it } from "@jest/globals";
import {
  watchCreateInputSchema,
  watchUpdateInputSchema,
  watchOutputSchema,
  watchWithCatalogOutputSchema,
  alertOutputSchema,
  alertWithDetailsOutputSchema,
  dropEventOutputSchema,
} from "./watch.js";

const validWatch = {
  id: "11111111-1111-4111-8111-111111111111",
  authUserId: "22222222-2222-4222-8222-222222222222",
  watchableUnitId: "33333333-3333-4333-8333-333333333333",
  skuId: null,
  notifyPush: true,
  notifyEmail: false,
  active: true,
  createdAt: new Date("2025-01-01T00:00:00Z"),
  updatedAt: new Date("2025-01-02T00:00:00Z"),
};

describe("watchCreateInputSchema", () => {
  it("accepts required fields only with defaults applied", () => {
    const result = watchCreateInputSchema.parse({
      watchableUnitId: "33333333-3333-4333-8333-333333333333",
    });
    expect(result.notifyPush).toBe(true);
    expect(result.notifyEmail).toBe(false);
    expect(result.skuId).toBeUndefined();
  });

  it("accepts all fields", () => {
    const result = watchCreateInputSchema.parse({
      watchableUnitId: "33333333-3333-4333-8333-333333333333",
      skuId: "44444444-4444-4444-8444-444444444444",
      notifyPush: false,
      notifyEmail: true,
    });
    expect(result.skuId).toBe("44444444-4444-4444-8444-444444444444");
    expect(result.notifyEmail).toBe(true);
  });

  it("rejects missing watchableUnitId", () => {
    expect(watchCreateInputSchema.safeParse({}).success).toBe(false);
  });

  it("rejects invalid uuid for watchableUnitId", () => {
    expect(
      watchCreateInputSchema.safeParse({ watchableUnitId: "not-a-uuid" })
        .success,
    ).toBe(false);
  });

  it("rejects invalid uuid for skuId", () => {
    expect(
      watchCreateInputSchema.safeParse({
        watchableUnitId: "33333333-3333-4333-8333-333333333333",
        skuId: "not-a-uuid",
      }).success,
    ).toBe(false);
  });
});

describe("watchUpdateInputSchema", () => {
  it("accepts id only", () => {
    const result = watchUpdateInputSchema.parse({
      id: "11111111-1111-4111-8111-111111111111",
    });
    expect(result.id).toBe("11111111-1111-4111-8111-111111111111");
    expect(result.notifyPush).toBeUndefined();
  });

  it("accepts all optional fields", () => {
    const result = watchUpdateInputSchema.parse({
      id: "11111111-1111-4111-8111-111111111111",
      notifyPush: false,
      notifyEmail: true,
      active: false,
    });
    expect(result.notifyPush).toBe(false);
    expect(result.notifyEmail).toBe(true);
    expect(result.active).toBe(false);
  });

  it("rejects missing id", () => {
    expect(
      watchUpdateInputSchema.safeParse({ notifyPush: false }).success,
    ).toBe(false);
  });

  it("rejects invalid uuid for id", () => {
    expect(
      watchUpdateInputSchema.safeParse({ id: "not-a-uuid" }).success,
    ).toBe(false);
  });
});

describe("watchOutputSchema", () => {
  it("accepts a valid watch", () => {
    expect(watchOutputSchema.parse(validWatch)).toEqual(validWatch);
  });

  it("accepts null skuId", () => {
    expect(
      watchOutputSchema.parse({ ...validWatch, skuId: null }).skuId,
    ).toBeNull();
  });

  it("accepts a non-null skuId", () => {
    const result = watchOutputSchema.parse({
      ...validWatch,
      skuId: "44444444-4444-4444-8444-444444444444",
    });
    expect(result.skuId).toBe("44444444-4444-4444-8444-444444444444");
  });

  it("rejects missing authUserId", () => {
    const { authUserId: _, ...rest } = validWatch;
    expect(watchOutputSchema.safeParse(rest).success).toBe(false);
  });
});

describe("watchWithCatalogOutputSchema", () => {
  const validWatchableUnit = {
    id: "33333333-3333-4333-8333-333333333333",
    brand: "Hermes",
    productLine: "Birkin",
    modelName: "Birkin 25",
    imageUrl: null,
  };

  it("accepts a watch with watchableUnit and null sku", () => {
    const result = watchWithCatalogOutputSchema.parse({
      ...validWatch,
      watchableUnit: validWatchableUnit,
      sku: null,
    });
    expect(result.watchableUnit.brand).toBe("Hermes");
    expect(result.sku).toBeNull();
  });

  it("accepts a watch with a populated sku", () => {
    const result = watchWithCatalogOutputSchema.parse({
      ...validWatch,
      watchableUnit: validWatchableUnit,
      sku: {
        id: "44444444-4444-4444-8444-444444444444",
        color: "Noir",
        leather: "Togo",
        hardware: null,
        size: "25",
      },
    });
    expect(result.sku!.color).toBe("Noir");
    expect(result.sku!.hardware).toBeNull();
  });

  it("rejects missing watchableUnit", () => {
    expect(
      watchWithCatalogOutputSchema.safeParse({ ...validWatch, sku: null })
        .success,
    ).toBe(false);
  });
});

const validAlert = {
  id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
  watchId: "11111111-1111-4111-8111-111111111111",
  dropEventId: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
  channel: "push",
  sentAt: null,
  readAt: null,
  createdAt: new Date("2025-01-01T00:00:00Z"),
};

describe("alertOutputSchema", () => {
  it("accepts a valid alert with null sentAt and readAt", () => {
    expect(alertOutputSchema.parse(validAlert)).toEqual(validAlert);
  });

  it("accepts non-null sentAt and readAt", () => {
    const result = alertOutputSchema.parse({
      ...validAlert,
      sentAt: new Date("2025-01-01T01:00:00Z"),
      readAt: new Date("2025-01-01T02:00:00Z"),
    });
    expect(result.sentAt).toBeDefined();
    expect(result.readAt).toBeDefined();
  });

  it("rejects missing channel", () => {
    const { channel: _, ...rest } = validAlert;
    expect(alertOutputSchema.safeParse(rest).success).toBe(false);
  });
});

describe("alertWithDetailsOutputSchema", () => {
  it("accepts an alert with dropEvent details", () => {
    const result = alertWithDetailsOutputSchema.parse({
      ...validAlert,
      dropEvent: {
        id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
        skuId: "44444444-4444-4444-8444-444444444444",
        sourceUrl: null,
        detectedAt: new Date("2025-01-01T00:00:00Z"),
      },
    });
    expect(result.dropEvent.skuId).toBe("44444444-4444-4444-8444-444444444444");
    expect(result.dropEvent.sourceUrl).toBeNull();
  });

  it("accepts an alert with a sourceUrl on the dropEvent", () => {
    const result = alertWithDetailsOutputSchema.parse({
      ...validAlert,
      dropEvent: {
        id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
        skuId: "44444444-4444-4444-8444-444444444444",
        sourceUrl: "https://hermes.com/product",
        detectedAt: new Date("2025-01-01T00:00:00Z"),
      },
    });
    expect(result.dropEvent.sourceUrl).toBe("https://hermes.com/product");
  });

  it("rejects missing dropEvent", () => {
    expect(alertWithDetailsOutputSchema.safeParse(validAlert).success).toBe(
      false,
    );
  });
});

describe("dropEventOutputSchema", () => {
  const validDropEvent = {
    id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
    skuId: "44444444-4444-4444-8444-444444444444",
    sourceUrl: "https://hermes.com/",
    detectedAt: new Date("2025-01-01T00:00:00Z"),
    expiredAt: null,
  };

  it("accepts a fully populated drop event", () => {
    expect(dropEventOutputSchema.parse(validDropEvent)).toEqual(validDropEvent);
  });

  it("accepts null sourceUrl", () => {
    const result = dropEventOutputSchema.parse({
      ...validDropEvent,
      sourceUrl: null,
    });
    expect(result.sourceUrl).toBeNull();
  });

  it("accepts non-null expiredAt", () => {
    const result = dropEventOutputSchema.parse({
      ...validDropEvent,
      expiredAt: new Date("2025-01-02T00:00:00Z"),
    });
    expect(result.expiredAt).toBeDefined();
  });

  it("rejects missing skuId", () => {
    const { skuId: _, ...rest } = validDropEvent;
    expect(dropEventOutputSchema.safeParse(rest).success).toBe(false);
  });
});
