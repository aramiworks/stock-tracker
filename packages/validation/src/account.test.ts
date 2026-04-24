import { describe, expect, it } from "@jest/globals";
import {
  accountCreateInputSchema,
  accountOutputSchema,
  accountUpdateInputSchema,
  accountWithPurchasesOutputSchema,
} from "./account.js";

describe("accountCreateInputSchema", () => {
  it("accepts the minimum payload (storeName only)", () => {
    expect(accountCreateInputSchema.parse({ storeName: "Hermès" })).toEqual({
      storeName: "Hermès",
    });
  });

  it("accepts a fully populated payload", () => {
    expect(
      accountCreateInputSchema.parse({
        storeName: "Hermès",
        saName: "Mr. Park",
        notes: "VIP customer",
      }),
    ).toEqual({
      storeName: "Hermès",
      saName: "Mr. Park",
      notes: "VIP customer",
    });
  });

  it("trims whitespace on storeName", () => {
    expect(
      accountCreateInputSchema.parse({ storeName: "  Hermès  " }).storeName,
    ).toBe("Hermès");
  });

  it("rejects an empty storeName", () => {
    expect(accountCreateInputSchema.safeParse({ storeName: "" }).success).toBe(
      false,
    );
  });

  it("rejects a storeName exceeding the max length", () => {
    expect(
      accountCreateInputSchema.safeParse({ storeName: "a".repeat(256) })
        .success,
    ).toBe(false);
  });

  it("rejects when storeName is missing", () => {
    expect(accountCreateInputSchema.safeParse({}).success).toBe(false);
  });
});

const validId = "11111111-1111-4111-8111-111111111111";

describe("accountUpdateInputSchema", () => {
  it("accepts the minimum payload (id only)", () => {
    expect(accountUpdateInputSchema.parse({ id: validId })).toEqual({
      id: validId,
    });
  });

  it("accepts a partial update", () => {
    expect(
      accountUpdateInputSchema.parse({ id: validId, storeName: "New Store" }),
    ).toEqual({ id: validId, storeName: "New Store" });
  });

  it("accepts null for nullish fields", () => {
    expect(
      accountUpdateInputSchema.parse({
        id: validId,
        saName: null,
        notes: null,
      }),
    ).toEqual({ id: validId, saName: null, notes: null });
  });

  it("rejects when id is missing", () => {
    expect(accountUpdateInputSchema.safeParse({}).success).toBe(false);
  });

  it("rejects a non-uuid id", () => {
    expect(accountUpdateInputSchema.safeParse({ id: "nope" }).success).toBe(
      false,
    );
  });

  it("rejects an empty storeName", () => {
    expect(
      accountUpdateInputSchema.safeParse({ id: validId, storeName: "" })
        .success,
    ).toBe(false);
  });
});

const validOutput = {
  id: validId,
  authUserId: "22222222-2222-4222-8222-222222222222",
  storeName: "Hermès",
  saName: "Mr. Park",
  notes: "VIP",
  createdAt: new Date("2025-01-01T00:00:00Z"),
  updatedAt: new Date("2025-01-02T00:00:00Z"),
};

describe("accountOutputSchema", () => {
  it("accepts a fully populated record", () => {
    expect(accountOutputSchema.parse(validOutput)).toEqual(validOutput);
  });

  it("accepts null for nullable fields", () => {
    expect(
      accountOutputSchema.parse({
        ...validOutput,
        saName: null,
        notes: null,
      }),
    ).toMatchObject({ saName: null, notes: null });
  });

  it("rejects a non-uuid id", () => {
    expect(
      accountOutputSchema.safeParse({ ...validOutput, id: "nope" }).success,
    ).toBe(false);
  });
});

describe("accountWithPurchasesOutputSchema", () => {
  it("accepts a record with an empty purchases array", () => {
    expect(
      accountWithPurchasesOutputSchema.parse({
        ...validOutput,
        purchases: [],
      }).purchases,
    ).toEqual([]);
  });

  it("accepts a record with one purchase", () => {
    const purchase = {
      id: "33333333-3333-4333-8333-333333333333",
      trackerAccountId: validId,
      itemName: "Watch",
      itemCategory: "시계",
      amount: "100.00",
      currency: "USD",
      purchaseDate: new Date("2025-01-15T00:00:00Z"),
      storeLocation: "Seoul",
      notes: null,
      createdAt: new Date("2025-01-15T00:00:00Z"),
      updatedAt: new Date("2025-01-15T00:00:00Z"),
    };
    expect(
      accountWithPurchasesOutputSchema.parse({
        ...validOutput,
        purchases: [purchase],
      }).purchases,
    ).toHaveLength(1);
  });

  it("rejects when purchases is missing", () => {
    expect(
      accountWithPurchasesOutputSchema.safeParse(validOutput).success,
    ).toBe(false);
  });
});
