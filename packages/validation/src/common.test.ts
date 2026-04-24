import { describe, expect, it } from "@jest/globals";
import {
  amountRangeSchema,
  currencySchema,
  dateRangeSchema,
  itemCategorySchema,
  paginationInputSchema,
  sanitizedString,
  sortOrderSchema,
  uuidSchema,
} from "./common.js";

describe("uuidSchema", () => {
  it("accepts a valid uuid", () => {
    expect(uuidSchema.parse("11111111-1111-4111-8111-111111111111")).toBe(
      "11111111-1111-4111-8111-111111111111",
    );
  });

  it("rejects a non-uuid string", () => {
    expect(uuidSchema.safeParse("not-a-uuid").success).toBe(false);
  });
});

describe("paginationInputSchema", () => {
  it("applies the default limit when omitted", () => {
    expect(paginationInputSchema.parse({})).toEqual({ limit: 20 });
  });

  it("accepts a valid cursor and limit", () => {
    const cursor = "11111111-1111-4111-8111-111111111111";
    expect(paginationInputSchema.parse({ cursor, limit: 50 })).toEqual({
      cursor,
      limit: 50,
    });
  });

  it("rejects a non-uuid cursor", () => {
    expect(
      paginationInputSchema.safeParse({ cursor: "nope", limit: 10 }).success,
    ).toBe(false);
  });

  it("rejects a limit below 1", () => {
    expect(paginationInputSchema.safeParse({ limit: 0 }).success).toBe(false);
  });

  it("rejects a limit above 100", () => {
    expect(paginationInputSchema.safeParse({ limit: 101 }).success).toBe(false);
  });

  it("rejects a non-integer limit", () => {
    expect(paginationInputSchema.safeParse({ limit: 5.5 }).success).toBe(false);
  });
});

describe("sortOrderSchema", () => {
  it("defaults to desc", () => {
    expect(sortOrderSchema.parse(undefined)).toBe("desc");
  });

  it("accepts asc", () => {
    expect(sortOrderSchema.parse("asc")).toBe("asc");
  });

  it("rejects unknown values", () => {
    expect(sortOrderSchema.safeParse("sideways").success).toBe(false);
  });
});

describe("currencySchema", () => {
  it.each(["KRW", "USD", "EUR", "JPY", "GBP", "CNY"] as const)(
    "accepts %s",
    (code) => {
      expect(currencySchema.parse(code)).toBe(code);
    },
  );

  it("rejects an unknown currency", () => {
    expect(currencySchema.safeParse("BTC").success).toBe(false);
  });
});

describe("itemCategorySchema", () => {
  it("accepts a known category", () => {
    expect(itemCategorySchema.parse("브레이슬릿")).toBe("브레이슬릿");
  });

  it("rejects an unknown category", () => {
    expect(itemCategorySchema.safeParse("unknown").success).toBe(false);
  });
});

describe("sanitizedString", () => {
  const schema = sanitizedString(10);

  it("trims leading and trailing whitespace", () => {
    expect(schema.parse("  hello  ")).toBe("hello");
  });

  it("rejects strings exceeding the max length", () => {
    expect(schema.safeParse("a".repeat(11)).success).toBe(false);
  });

  it("rejects strings containing control characters", () => {
    const result = schema.safeParse("hi\u0000there");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]!.message).toBe(
        "Must not contain control characters",
      );
    }
  });

  it("accepts an empty string", () => {
    expect(schema.parse("")).toBe("");
  });
});

describe("dateRangeSchema", () => {
  it("accepts undefined (optional)", () => {
    expect(dateRangeSchema.parse(undefined)).toBeUndefined();
  });

  it("accepts an empty object", () => {
    expect(dateRangeSchema.parse({})).toEqual({});
  });

  it("accepts from-only", () => {
    expect(dateRangeSchema.parse({ from: "2025-01-01" })).toEqual({
      from: "2025-01-01",
    });
  });

  it("accepts to-only", () => {
    expect(dateRangeSchema.parse({ to: "2025-12-31" })).toEqual({
      to: "2025-12-31",
    });
  });

  it("accepts from <= to", () => {
    expect(
      dateRangeSchema.parse({ from: "2025-01-01", to: "2025-12-31" }),
    ).toEqual({ from: "2025-01-01", to: "2025-12-31" });
  });

  it("rejects from > to", () => {
    const result = dateRangeSchema.safeParse({
      from: "2025-12-31",
      to: "2025-01-01",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]!.message).toBe(
        "dateRange.from must not be after dateRange.to",
      );
    }
  });

  it("rejects an invalid date string", () => {
    expect(dateRangeSchema.safeParse({ from: "not-a-date" }).success).toBe(
      false,
    );
  });
});

describe("amountRangeSchema", () => {
  it("accepts undefined (optional)", () => {
    expect(amountRangeSchema.parse(undefined)).toBeUndefined();
  });

  it("accepts an empty object", () => {
    expect(amountRangeSchema.parse({})).toEqual({});
  });

  it("accepts min-only", () => {
    expect(amountRangeSchema.parse({ min: 10 })).toEqual({ min: 10 });
  });

  it("accepts max-only", () => {
    expect(amountRangeSchema.parse({ max: 100 })).toEqual({ max: 100 });
  });

  it("accepts min <= max", () => {
    expect(amountRangeSchema.parse({ min: 10, max: 100 })).toEqual({
      min: 10,
      max: 100,
    });
  });

  it("rejects min > max", () => {
    const result = amountRangeSchema.safeParse({ min: 100, max: 10 });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]!.message).toBe(
        "amountRange.min must not exceed amountRange.max",
      );
    }
  });

  it("rejects non-positive min", () => {
    expect(amountRangeSchema.safeParse({ min: 0 }).success).toBe(false);
  });

  it("rejects max above the cap", () => {
    expect(amountRangeSchema.safeParse({ max: 10_000_000_000 }).success).toBe(
      false,
    );
  });
});
