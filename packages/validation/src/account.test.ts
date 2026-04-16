import { describe, it, expect } from "@jest/globals";
import {
  accountCreateInputSchema,
  accountUpdateInputSchema,
  accountOutputSchema,
  accountWithPurchasesOutputSchema,
} from "./account.js";

describe("accountCreateInputSchema", () => {
  it("accepts a valid store name", () => {
    const result = accountCreateInputSchema.parse({
      storeName: "Cartier Gangnam",
    });
    expect(result.storeName).toBe("Cartier Gangnam");
  });

  it("accepts all optional fields", () => {
    const result = accountCreateInputSchema.parse({
      storeName: "Cartier Gangnam",
      saName: "Kim SA",
      notes: "VIP account",
    });
    expect(result.saName).toBe("Kim SA");
    expect(result.notes).toBe("VIP account");
  });

  it("rejects empty store name", () => {
    expect(() => accountCreateInputSchema.parse({ storeName: "" })).toThrow();
  });

  it("rejects store name with control characters", () => {
    expect(() =>
      accountCreateInputSchema.parse({ storeName: "Store\x00Name" }),
    ).toThrow();
  });

  it("trims whitespace from storeName", () => {
    const result = accountCreateInputSchema.parse({
      storeName: "  Cartier  ",
    });
    expect(result.storeName).toBe("Cartier");
  });
});

describe("accountUpdateInputSchema", () => {
  const validId = "550e8400-e29b-41d4-a716-446655440000";

  it("requires a valid UUID id", () => {
    const result = accountUpdateInputSchema.parse({ id: validId });
    expect(result.id).toBe(validId);
  });

  it("rejects non-UUID id", () => {
    expect(() => accountUpdateInputSchema.parse({ id: "abc" })).toThrow();
  });

  it("accepts optional field updates", () => {
    const result = accountUpdateInputSchema.parse({
      id: validId,
      storeName: "Updated Store",
    });
    expect(result.storeName).toBe("Updated Store");
  });

  it("accepts nullish fields for clearing", () => {
    const result = accountUpdateInputSchema.parse({
      id: validId,
      saName: null,
      notes: null,
    });
    expect(result.saName).toBeNull();
    expect(result.notes).toBeNull();
  });
});

describe("accountOutputSchema", () => {
  it("accepts a valid output shape", () => {
    const result = accountOutputSchema.parse({
      id: "550e8400-e29b-41d4-a716-446655440000",
      authUserId: "550e8400-e29b-41d4-a716-446655440001",
      storeName: "Cartier Gangnam",
      saName: "Kim SA",
      notes: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    expect(result.storeName).toBe("Cartier Gangnam");
  });
});

describe("accountWithPurchasesOutputSchema", () => {
  it("extends accountOutputSchema with purchases array", () => {
    const result = accountWithPurchasesOutputSchema.parse({
      id: "550e8400-e29b-41d4-a716-446655440000",
      authUserId: "550e8400-e29b-41d4-a716-446655440001",
      storeName: "Cartier Gangnam",
      saName: null,
      notes: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      purchases: [
        {
          id: "550e8400-e29b-41d4-a716-446655440002",
          trackerAccountId: "550e8400-e29b-41d4-a716-446655440000",
          itemName: "Love Bracelet",
          itemCategory: null,
          amount: "5000000",
          currency: "KRW",
          purchaseDate: new Date("2025-06-01"),
          storeLocation: null,
          notes: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
    });
    expect(result.purchases).toHaveLength(1);
  });

  it("accepts empty purchases array", () => {
    const result = accountWithPurchasesOutputSchema.parse({
      id: "550e8400-e29b-41d4-a716-446655440000",
      authUserId: "550e8400-e29b-41d4-a716-446655440001",
      storeName: "Cartier Gangnam",
      saName: null,
      notes: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      purchases: [],
    });
    expect(result.purchases).toHaveLength(0);
  });
});
