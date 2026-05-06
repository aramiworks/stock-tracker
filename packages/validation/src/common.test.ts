import { describe, expect, it } from "@jest/globals";
import {
  dateRangeSchema,
  brandSchema,
  alertChannelSchema,
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

describe("brandSchema", () => {
  it.each([
    "Hermes",
    "Chanel",
    "Dior",
    "LouisVuitton",
    "Gucci",
    "Celine",
    "Bottega",
    "Other",
  ] as const)("accepts %s", (brand) => {
    expect(brandSchema.parse(brand)).toBe(brand);
  });

  it("rejects an unknown brand", () => {
    expect(brandSchema.safeParse("Supreme").success).toBe(false);
  });
});

describe("alertChannelSchema", () => {
  it("accepts push", () => {
    expect(alertChannelSchema.parse("push")).toBe("push");
  });

  it("accepts email", () => {
    expect(alertChannelSchema.parse("email")).toBe("email");
  });

  it("rejects unknown channel", () => {
    expect(alertChannelSchema.safeParse("sms").success).toBe(false);
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
