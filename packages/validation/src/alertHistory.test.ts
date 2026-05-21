import { describe, expect, it } from "@jest/globals";
import {
  alertHistoryListInputSchema,
  alertHistoryEventOutputSchema,
  alertHistoryListOutputSchema,
  alertHistoryKindSchema,
} from "./alertHistory.js";

const validEvent = {
  id: "11111111-1111-4111-8111-111111111111",
  brand: "Hermes",
  productLine: "Birkin",
  modelName: "Birkin 25",
  skuDescriptor: "Noir · Togo · GHW · 25",
  kind: "restocked" as const,
  detectedAt: new Date("2025-05-01T00:00:00Z"),
};

describe("alertHistoryKindSchema", () => {
  it("accepts 'restocked'", () => {
    expect(alertHistoryKindSchema.parse("restocked")).toBe("restocked");
  });

  it("accepts 'soldOut'", () => {
    expect(alertHistoryKindSchema.parse("soldOut")).toBe("soldOut");
  });

  it("rejects unknown kinds", () => {
    expect(alertHistoryKindSchema.safeParse("priceChange").success).toBe(false);
  });
});

describe("alertHistoryListInputSchema", () => {
  it("applies default limit when input is empty", () => {
    const result = alertHistoryListInputSchema.parse({});
    expect(result.limit).toBe(20);
    expect(result.cursor).toBeUndefined();
  });

  it("accepts explicit limit and cursor", () => {
    const result = alertHistoryListInputSchema.parse({
      limit: 50,
      cursor: "2025-05-01T00:00:00.000Z",
    });
    expect(result.limit).toBe(50);
    expect(result.cursor).toBe("2025-05-01T00:00:00.000Z");
  });

  it("accepts null cursor (first page)", () => {
    const result = alertHistoryListInputSchema.parse({ cursor: null });
    expect(result.cursor).toBeNull();
  });

  it("rejects limit below 1", () => {
    expect(alertHistoryListInputSchema.safeParse({ limit: 0 }).success).toBe(
      false,
    );
  });

  it("rejects limit above 100", () => {
    expect(alertHistoryListInputSchema.safeParse({ limit: 101 }).success).toBe(
      false,
    );
  });

  it("rejects non-ISO cursor", () => {
    expect(
      alertHistoryListInputSchema.safeParse({ cursor: "not-a-date" }).success,
    ).toBe(false);
  });
});

describe("alertHistoryEventOutputSchema", () => {
  it("accepts a fully populated event", () => {
    expect(alertHistoryEventOutputSchema.parse(validEvent)).toEqual(validEvent);
  });

  it("accepts a null skuDescriptor", () => {
    const result = alertHistoryEventOutputSchema.parse({
      ...validEvent,
      skuDescriptor: null,
    });
    expect(result.skuDescriptor).toBeNull();
  });

  it("accepts kind 'soldOut'", () => {
    const result = alertHistoryEventOutputSchema.parse({
      ...validEvent,
      kind: "soldOut",
    });
    expect(result.kind).toBe("soldOut");
  });

  it("rejects missing brand", () => {
    const { brand: _, ...rest } = validEvent;
    expect(alertHistoryEventOutputSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects invalid kind", () => {
    expect(
      alertHistoryEventOutputSchema.safeParse({ ...validEvent, kind: "other" })
        .success,
    ).toBe(false);
  });
});

describe("alertHistoryListOutputSchema", () => {
  it("accepts a page with events and null cursor", () => {
    const result = alertHistoryListOutputSchema.parse({
      events: [validEvent],
      nextCursor: null,
    });
    expect(result.events).toHaveLength(1);
    expect(result.nextCursor).toBeNull();
  });

  it("accepts an empty events array", () => {
    const result = alertHistoryListOutputSchema.parse({
      events: [],
      nextCursor: null,
    });
    expect(result.events).toEqual([]);
  });

  it("accepts a non-null nextCursor ISO string", () => {
    const result = alertHistoryListOutputSchema.parse({
      events: [validEvent],
      nextCursor: "2025-05-01T00:00:00.000Z",
    });
    expect(result.nextCursor).toBe("2025-05-01T00:00:00.000Z");
  });

  it("rejects missing nextCursor", () => {
    expect(
      alertHistoryListOutputSchema.safeParse({ events: [validEvent] }).success,
    ).toBe(false);
  });
});
