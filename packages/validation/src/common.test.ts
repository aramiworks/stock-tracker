import { describe, it, expect } from "@jest/globals";
import {
  uuidSchema,
  paginationInputSchema,
  sortOrderSchema,
  currencySchema,
  itemCategorySchema,
  sanitizedString,
  dateRangeSchema,
  amountRangeSchema,
} from "./common.js";

describe("uuidSchema", () => {
  it("accepts a valid UUID", () => {
    expect(
      uuidSchema.parse("550e8400-e29b-41d4-a716-446655440000"),
    ).toBeDefined();
  });

  it("rejects a non-UUID string", () => {
    expect(() => uuidSchema.parse("not-a-uuid")).toThrow();
  });
});

describe("paginationInputSchema", () => {
  it("defaults limit to 20", () => {
    const result = paginationInputSchema.parse({});
    expect(result.limit).toBe(20);
    expect(result.cursor).toBeUndefined();
  });

  it("accepts a valid cursor UUID", () => {
    const result = paginationInputSchema.parse({
      cursor: "550e8400-e29b-41d4-a716-446655440000",
    });
    expect(result.cursor).toBe("550e8400-e29b-41d4-a716-446655440000");
  });

  it("rejects a non-UUID cursor", () => {
    expect(() => paginationInputSchema.parse({ cursor: "abc" })).toThrow();
  });

  it("rejects limit below 1", () => {
    expect(() => paginationInputSchema.parse({ limit: 0 })).toThrow();
  });

  it("rejects limit above 100", () => {
    expect(() => paginationInputSchema.parse({ limit: 101 })).toThrow();
  });

  it("accepts limit at boundaries", () => {
    expect(paginationInputSchema.parse({ limit: 1 }).limit).toBe(1);
    expect(paginationInputSchema.parse({ limit: 100 }).limit).toBe(100);
  });
});

describe("sortOrderSchema", () => {
  it("defaults to desc", () => {
    expect(sortOrderSchema.parse(undefined)).toBe("desc");
  });

  it("accepts asc", () => {
    expect(sortOrderSchema.parse("asc")).toBe("asc");
  });

  it("accepts desc", () => {
    expect(sortOrderSchema.parse("desc")).toBe("desc");
  });

  it("rejects invalid values", () => {
    expect(() => sortOrderSchema.parse("up")).toThrow();
  });
});

describe("currencySchema", () => {
  const validCurrencies = ["KRW", "USD", "EUR", "JPY", "GBP", "CNY"];

  it.each(validCurrencies)("accepts %s", (currency) => {
    expect(currencySchema.parse(currency)).toBe(currency);
  });

  it("rejects invalid currency", () => {
    expect(() => currencySchema.parse("AUD")).toThrow();
  });
});

describe("itemCategorySchema", () => {
  const validCategories = [
    "브레이슬릿",
    "목걸이",
    "시계",
    "반지",
    "귀걸이",
    "가방",
    "지갑",
    "벨트",
    "기타",
  ];

  it.each(validCategories)("accepts %s", (category) => {
    expect(itemCategorySchema.parse(category)).toBe(category);
  });

  it("rejects invalid category", () => {
    expect(() => itemCategorySchema.parse("bracelet")).toThrow();
  });
});

describe("sanitizedString", () => {
  const schema = sanitizedString(100);

  it("accepts a normal string", () => {
    expect(schema.parse("hello world")).toBe("hello world");
  });

  it("trims whitespace", () => {
    expect(schema.parse("  hello  ")).toBe("hello");
  });

  it("rejects strings exceeding max length", () => {
    expect(() => schema.parse("a".repeat(101))).toThrow();
  });

  it("accepts strings at max length", () => {
    expect(schema.parse("a".repeat(100))).toBe("a".repeat(100));
  });

  it("rejects strings with control characters", () => {
    expect(() => schema.parse("hello\x00world")).toThrow();
    expect(() => schema.parse("hello\x07world")).toThrow();
    expect(() => schema.parse("hello\x7fworld")).toThrow();
  });

  it("trims all-whitespace to empty string (passes base schema)", () => {
    expect(schema.parse("   ")).toBe("");
  });

  it("allows newlines and tabs (not control chars in the regex)", () => {
    expect(schema.parse("hello\nworld")).toBe("hello\nworld");
    expect(schema.parse("hello\tworld")).toBe("hello\tworld");
  });
});

describe("dateRangeSchema", () => {
  it("accepts undefined (optional)", () => {
    expect(dateRangeSchema.parse(undefined)).toBeUndefined();
  });

  it("accepts empty object", () => {
    expect(dateRangeSchema.parse({})).toEqual({});
  });

  it("accepts from only", () => {
    expect(dateRangeSchema.parse({ from: "2025-01-01" })).toEqual({
      from: "2025-01-01",
    });
  });

  it("accepts to only", () => {
    expect(dateRangeSchema.parse({ to: "2025-12-31" })).toEqual({
      to: "2025-12-31",
    });
  });

  it("accepts from <= to", () => {
    expect(
      dateRangeSchema.parse({ from: "2025-01-01", to: "2025-12-31" }),
    ).toEqual({ from: "2025-01-01", to: "2025-12-31" });
  });

  it("accepts from === to", () => {
    expect(
      dateRangeSchema.parse({ from: "2025-06-15", to: "2025-06-15" }),
    ).toEqual({ from: "2025-06-15", to: "2025-06-15" });
  });

  it("rejects from > to", () => {
    expect(() =>
      dateRangeSchema.parse({ from: "2025-12-31", to: "2025-01-01" }),
    ).toThrow();
  });

  it("rejects invalid date strings", () => {
    expect(() => dateRangeSchema.parse({ from: "not-a-date" })).toThrow();
  });
});

describe("amountRangeSchema", () => {
  it("accepts undefined (optional)", () => {
    expect(amountRangeSchema.parse(undefined)).toBeUndefined();
  });

  it("accepts empty object", () => {
    expect(amountRangeSchema.parse({})).toEqual({});
  });

  it("accepts min only", () => {
    expect(amountRangeSchema.parse({ min: 100 })).toEqual({ min: 100 });
  });

  it("accepts max only", () => {
    expect(amountRangeSchema.parse({ max: 5000 })).toEqual({ max: 5000 });
  });

  it("accepts min <= max", () => {
    expect(amountRangeSchema.parse({ min: 100, max: 5000 })).toEqual({
      min: 100,
      max: 5000,
    });
  });

  it("accepts min === max", () => {
    expect(amountRangeSchema.parse({ min: 100, max: 100 })).toEqual({
      min: 100,
      max: 100,
    });
  });

  it("rejects min > max", () => {
    expect(() => amountRangeSchema.parse({ min: 5000, max: 100 })).toThrow();
  });

  it("rejects non-positive min", () => {
    expect(() => amountRangeSchema.parse({ min: 0 })).toThrow();
    expect(() => amountRangeSchema.parse({ min: -1 })).toThrow();
  });

  it("rejects max exceeding limit", () => {
    expect(() => amountRangeSchema.parse({ max: 10_000_000_000 })).toThrow();
  });

  it("accepts max at boundary", () => {
    expect(amountRangeSchema.parse({ max: 9_999_999_999.99 })).toEqual({
      max: 9_999_999_999.99,
    });
  });
});
