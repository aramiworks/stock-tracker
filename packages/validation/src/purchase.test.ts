import { describe, it, expect, jest, beforeAll, afterAll } from "@jest/globals";
import {
  purchaseCreateInputSchema,
  purchaseUpdateInputSchema,
  purchaseOutputSchema,
  purchaseWithAccountOutputSchema,
} from "./purchase.js";

beforeAll(() => {
  jest.useFakeTimers();
  jest.setSystemTime(new Date("2025-06-15T12:00:00Z"));
});

afterAll(() => {
  jest.useRealTimers();
});

describe("purchaseCreateInputSchema", () => {
  const validInput = {
    itemName: "Love Bracelet",
    itemCategory: "브레이슬릿",
    amount: 5000000,
    purchaseDate: "2025-06-01",
  };

  it("accepts valid input with defaults", () => {
    const result = purchaseCreateInputSchema.parse(validInput);
    expect(result.currency).toBe("KRW");
    expect(result.itemName).toBe("Love Bracelet");
  });

  it("accepts all optional fields", () => {
    const result = purchaseCreateInputSchema.parse({
      ...validInput,
      currency: "USD",
      storeLocation: "Gangnam Store",
      notes: "Birthday gift",
    });
    expect(result.currency).toBe("USD");
    expect(result.storeLocation).toBe("Gangnam Store");
    expect(result.notes).toBe("Birthday gift");
  });

  it("rejects empty itemName", () => {
    expect(() =>
      purchaseCreateInputSchema.parse({ ...validInput, itemName: "" }),
    ).toThrow();
  });

  it("rejects itemName with control characters", () => {
    expect(() =>
      purchaseCreateInputSchema.parse({
        ...validInput,
        itemName: "Love\x00Bracelet",
      }),
    ).toThrow();
  });

  it("rejects non-positive amount", () => {
    expect(() =>
      purchaseCreateInputSchema.parse({ ...validInput, amount: 0 }),
    ).toThrow();
    expect(() =>
      purchaseCreateInputSchema.parse({ ...validInput, amount: -100 }),
    ).toThrow();
  });

  it("rejects amount exceeding max", () => {
    expect(() =>
      purchaseCreateInputSchema.parse({
        ...validInput,
        amount: 10_000_000_000,
      }),
    ).toThrow();
  });

  it("rejects date before 2000-01-01", () => {
    expect(() =>
      purchaseCreateInputSchema.parse({
        ...validInput,
        purchaseDate: "1999-12-31",
      }),
    ).toThrow();
  });

  it("accepts date on 2000-01-01", () => {
    const result = purchaseCreateInputSchema.parse({
      ...validInput,
      purchaseDate: "2000-01-01",
    });
    expect(result.purchaseDate).toBe("2000-01-01");
  });

  it("rejects future date", () => {
    expect(() =>
      purchaseCreateInputSchema.parse({
        ...validInput,
        purchaseDate: "2025-12-31",
      }),
    ).toThrow();
  });

  it("accepts today's date", () => {
    const result = purchaseCreateInputSchema.parse({
      ...validInput,
      purchaseDate: "2025-06-15",
    });
    expect(result.purchaseDate).toBe("2025-06-15");
  });

  it("rejects missing required fields", () => {
    expect(() => purchaseCreateInputSchema.parse({})).toThrow();
    expect(() =>
      purchaseCreateInputSchema.parse({ itemName: "Ring" }),
    ).toThrow();
  });
});

describe("purchaseUpdateInputSchema", () => {
  it("accepts all fields optional", () => {
    const result = purchaseUpdateInputSchema.parse({});
    expect(result).toEqual({});
  });

  it("accepts individual field updates", () => {
    const result = purchaseUpdateInputSchema.parse({
      itemName: "Updated Ring",
    });
    expect(result.itemName).toBe("Updated Ring");
  });

  it("accepts nullish fields for clearing", () => {
    const result = purchaseUpdateInputSchema.parse({
      itemCategory: null,
      storeLocation: null,
      notes: null,
    });
    expect(result.itemCategory).toBeNull();
    expect(result.storeLocation).toBeNull();
    expect(result.notes).toBeNull();
  });

  it("validates individual fields", () => {
    expect(() => purchaseUpdateInputSchema.parse({ amount: -1 })).toThrow();
    expect(() =>
      purchaseUpdateInputSchema.parse({ purchaseDate: "1999-01-01" }),
    ).toThrow();
    expect(() =>
      purchaseUpdateInputSchema.parse({ purchaseDate: "2025-12-31" }),
    ).toThrow();
  });
});

describe("purchaseOutputSchema", () => {
  it("accepts a valid output shape", () => {
    const result = purchaseOutputSchema.parse({
      id: "550e8400-e29b-41d4-a716-446655440000",
      trackerAccountId: "550e8400-e29b-41d4-a716-446655440001",
      itemName: "Love Bracelet",
      itemCategory: "브레이슬릿",
      amount: "5000000",
      currency: "KRW",
      purchaseDate: new Date("2025-06-01"),
      storeLocation: "Gangnam Store",
      notes: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    expect(result.id).toBeDefined();
  });
});

describe("purchaseWithAccountOutputSchema", () => {
  it("extends purchaseOutputSchema with trackerAccount", () => {
    const result = purchaseWithAccountOutputSchema.parse({
      id: "550e8400-e29b-41d4-a716-446655440000",
      trackerAccountId: "550e8400-e29b-41d4-a716-446655440001",
      itemName: "Love Bracelet",
      itemCategory: null,
      amount: "5000000",
      currency: "KRW",
      purchaseDate: new Date("2025-06-01"),
      storeLocation: null,
      notes: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      trackerAccount: {
        id: "550e8400-e29b-41d4-a716-446655440001",
        storeName: "Cartier Gangnam",
      },
    });
    expect(result.trackerAccount.storeName).toBe("Cartier Gangnam");
  });
});
