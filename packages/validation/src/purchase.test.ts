import { describe, expect, it } from "@jest/globals";
import {
  purchaseCreateInputSchema,
  purchaseOutputSchema,
  purchaseUpdateInputSchema,
  purchaseWithAccountOutputSchema,
} from "./purchase.js";

const today = new Date().toISOString().slice(0, 10);

const validCreate = {
  itemName: "Watch",
  itemCategory: "시계" as const,
  amount: 100,
  currency: "USD" as const,
  purchaseDate: "2025-01-15",
  storeLocation: "Seoul",
  notes: "Birthday gift",
};

describe("purchaseCreateInputSchema", () => {
  it("accepts a fully populated payload", () => {
    expect(purchaseCreateInputSchema.parse(validCreate)).toEqual(validCreate);
  });

  it("applies the KRW default for currency", () => {
    const rest: Omit<typeof validCreate, "currency"> & { currency?: string } = {
      ...validCreate,
    };
    delete rest.currency;
    expect(purchaseCreateInputSchema.parse(rest).currency).toBe("KRW");
  });

  it("accepts the minimum payload", () => {
    expect(
      purchaseCreateInputSchema.parse({
        itemName: "Ring",
        amount: 50,
        purchaseDate: "2025-01-15",
      }),
    ).toMatchObject({
      itemName: "Ring",
      amount: 50,
      currency: "KRW",
      purchaseDate: "2025-01-15",
    });
  });

  it("rejects an empty itemName", () => {
    expect(
      purchaseCreateInputSchema.safeParse({ ...validCreate, itemName: "" })
        .success,
    ).toBe(false);
  });

  it("rejects an itemName exceeding the max length", () => {
    expect(
      purchaseCreateInputSchema.safeParse({
        ...validCreate,
        itemName: "a".repeat(256),
      }).success,
    ).toBe(false);
  });

  it("rejects a non-positive amount", () => {
    expect(
      purchaseCreateInputSchema.safeParse({ ...validCreate, amount: 0 }).success,
    ).toBe(false);
  });

  it("rejects an amount above the cap", () => {
    expect(
      purchaseCreateInputSchema.safeParse({
        ...validCreate,
        amount: 10_000_000_000,
      }).success,
    ).toBe(false);
  });

  it("rejects an unknown currency", () => {
    expect(
      purchaseCreateInputSchema.safeParse({ ...validCreate, currency: "BTC" })
        .success,
    ).toBe(false);
  });

  it("rejects a date before 2000-01-01", () => {
    const result = purchaseCreateInputSchema.safeParse({
      ...validCreate,
      purchaseDate: "1999-12-31",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]!.message).toBe(
        "Date must be on or after 2000-01-01",
      );
    }
  });

  it("rejects a future date", () => {
    const future = new Date(Date.now() + 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10);
    const result = purchaseCreateInputSchema.safeParse({
      ...validCreate,
      purchaseDate: future,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]!.message).toBe("Date must not be in the future");
    }
  });

  it("accepts today's date", () => {
    expect(
      purchaseCreateInputSchema.parse({
        ...validCreate,
        purchaseDate: today,
      }).purchaseDate,
    ).toBe(today);
  });

  it("rejects an invalid date string", () => {
    expect(
      purchaseCreateInputSchema.safeParse({
        ...validCreate,
        purchaseDate: "not-a-date",
      }).success,
    ).toBe(false);
  });
});

describe("purchaseUpdateInputSchema", () => {
  it("accepts an empty object (all fields optional)", () => {
    expect(purchaseUpdateInputSchema.parse({})).toEqual({});
  });

  it("accepts a partial update", () => {
    expect(purchaseUpdateInputSchema.parse({ itemName: "New Name" })).toEqual({
      itemName: "New Name",
    });
  });

  it("accepts null for nullish fields", () => {
    expect(
      purchaseUpdateInputSchema.parse({
        itemCategory: null,
        storeLocation: null,
        notes: null,
      }),
    ).toEqual({ itemCategory: null, storeLocation: null, notes: null });
  });

  it("rejects an empty itemName", () => {
    expect(
      purchaseUpdateInputSchema.safeParse({ itemName: "" }).success,
    ).toBe(false);
  });

  it("rejects an invalid purchaseDate", () => {
    expect(
      purchaseUpdateInputSchema.safeParse({ purchaseDate: "1999-12-31" })
        .success,
    ).toBe(false);
  });
});

const validOutput = {
  id: "11111111-1111-4111-8111-111111111111",
  trackerAccountId: "22222222-2222-4222-8222-222222222222",
  itemName: "Watch",
  itemCategory: "시계",
  amount: "100.00",
  currency: "USD",
  purchaseDate: new Date("2025-01-15T00:00:00Z"),
  storeLocation: "Seoul",
  notes: "Note",
  createdAt: new Date("2025-01-15T00:00:00Z"),
  updatedAt: new Date("2025-01-16T00:00:00Z"),
};

describe("purchaseOutputSchema", () => {
  it("accepts a fully populated record", () => {
    expect(purchaseOutputSchema.parse(validOutput)).toEqual(validOutput);
  });

  it("accepts nullable fields as null", () => {
    expect(
      purchaseOutputSchema.parse({
        ...validOutput,
        itemCategory: null,
        storeLocation: null,
        notes: null,
      }),
    ).toMatchObject({
      itemCategory: null,
      storeLocation: null,
      notes: null,
    });
  });

  it("rejects a non-uuid id", () => {
    expect(purchaseOutputSchema.safeParse({ ...validOutput, id: "nope" }).success).toBe(
      false,
    );
  });

  it("rejects a non-Date purchaseDate", () => {
    expect(
      purchaseOutputSchema.safeParse({
        ...validOutput,
        purchaseDate: "2025-01-15",
      }).success,
    ).toBe(false);
  });
});

describe("purchaseWithAccountOutputSchema", () => {
  it("accepts a record with the trackerAccount relation", () => {
    expect(
      purchaseWithAccountOutputSchema.parse({
        ...validOutput,
        trackerAccount: {
          id: "33333333-3333-4333-8333-333333333333",
          storeName: "Hermès",
        },
      }).trackerAccount,
    ).toEqual({
      id: "33333333-3333-4333-8333-333333333333",
      storeName: "Hermès",
    });
  });

  it("rejects when trackerAccount is missing", () => {
    expect(purchaseWithAccountOutputSchema.safeParse(validOutput).success).toBe(
      false,
    );
  });
});
