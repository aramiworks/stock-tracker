import { describe, expect, it } from "@jest/globals";
import {
  watchableUnitOutputSchema,
  watchableUnitWithSkusOutputSchema,
  skuOutputSchema,
  catalogBrowseInputSchema,
  catalogListOutputSchema,
} from "./catalog.js";

const validUnit = {
  id: "11111111-1111-4111-8111-111111111111",
  brand: "Hermes",
  productLine: "Birkin",
  modelName: "Birkin 25",
  imageUrl: null,
  active: true,
  createdAt: new Date("2025-01-01T00:00:00Z"),
  updatedAt: new Date("2025-01-02T00:00:00Z"),
};

const validSkuInUnit = {
  id: "22222222-2222-4222-8222-222222222222",
  color: "Noir",
  leather: "Togo",
  hardware: "GHW",
  size: "25",
  referenceCode: "HBX25NO",
  imageUrl: null,
  active: true,
};

describe("watchableUnitOutputSchema", () => {
  it("accepts a fully populated unit", () => {
    const result = watchableUnitOutputSchema.parse({
      ...validUnit,
      imageUrl: "https://example.com/img.jpg",
    });
    expect(result.imageUrl).toBe("https://example.com/img.jpg");
  });

  it("accepts null imageUrl", () => {
    const result = watchableUnitOutputSchema.parse(validUnit);
    expect(result.imageUrl).toBeNull();
  });

  it("rejects missing brand", () => {
    const { brand: _, ...rest } = validUnit;
    expect(watchableUnitOutputSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing modelName", () => {
    const { modelName: _, ...rest } = validUnit;
    expect(watchableUnitOutputSchema.safeParse(rest).success).toBe(false);
  });
});

describe("watchableUnitWithSkusOutputSchema", () => {
  it("accepts a unit with non-empty skus array", () => {
    const result = watchableUnitWithSkusOutputSchema.parse({
      ...validUnit,
      skus: [validSkuInUnit],
    });
    expect(result.skus).toHaveLength(1);
    expect(result.skus[0]!.color).toBe("Noir");
  });

  it("accepts a unit with empty skus array", () => {
    const result = watchableUnitWithSkusOutputSchema.parse({
      ...validUnit,
      skus: [],
    });
    expect(result.skus).toEqual([]);
  });

  it("accepts null optional sku fields", () => {
    const result = watchableUnitWithSkusOutputSchema.parse({
      ...validUnit,
      skus: [
        {
          ...validSkuInUnit,
          leather: null,
          hardware: null,
          size: null,
          referenceCode: null,
          imageUrl: null,
        },
      ],
    });
    expect(result.skus[0]!.leather).toBeNull();
    expect(result.skus[0]!.hardware).toBeNull();
  });
});

describe("skuOutputSchema", () => {
  const validSkuOutput = {
    id: "22222222-2222-4222-8222-222222222222",
    watchableUnitId: "11111111-1111-4111-8111-111111111111",
    color: "Noir",
    leather: "Togo",
    hardware: "GHW",
    size: "25",
    referenceCode: "HBX25NO",
    imageUrl: "https://example.com/sku.jpg",
    active: true,
    createdAt: new Date("2025-01-01T00:00:00Z"),
    updatedAt: new Date("2025-01-02T00:00:00Z"),
  };

  it("accepts a fully populated sku", () => {
    expect(skuOutputSchema.parse(validSkuOutput)).toEqual(validSkuOutput);
  });

  it("accepts null optional fields", () => {
    const result = skuOutputSchema.parse({
      ...validSkuOutput,
      leather: null,
      hardware: null,
      size: null,
      referenceCode: null,
      imageUrl: null,
    });
    expect(result.leather).toBeNull();
    expect(result.hardware).toBeNull();
    expect(result.size).toBeNull();
    expect(result.referenceCode).toBeNull();
    expect(result.imageUrl).toBeNull();
  });

  it("rejects missing color", () => {
    const { color: _, ...rest } = validSkuOutput;
    expect(skuOutputSchema.safeParse(rest).success).toBe(false);
  });
});

describe("catalogBrowseInputSchema", () => {
  it("defaults activeOnly to true when not provided", () => {
    const result = catalogBrowseInputSchema.parse({});
    expect(result.activeOnly).toBe(true);
  });

  it("accepts a valid brand", () => {
    const result = catalogBrowseInputSchema.parse({ brand: "Hermes" });
    expect(result.brand).toBe("Hermes");
  });

  it("rejects an invalid brand", () => {
    expect(
      catalogBrowseInputSchema.safeParse({ brand: "Supreme" }).success,
    ).toBe(false);
  });

  it("accepts a valid productLine (free-form string)", () => {
    const result = catalogBrowseInputSchema.parse({ productLine: "Birkin" });
    expect(result.productLine).toBe("Birkin");
  });

  it("accepts a search string", () => {
    const result = catalogBrowseInputSchema.parse({ search: "Birkin 25" });
    expect(result.search).toBe("Birkin 25");
  });

  it("accepts activeOnly false", () => {
    const result = catalogBrowseInputSchema.parse({ activeOnly: false });
    expect(result.activeOnly).toBe(false);
  });

  it("rejects a search string that exceeds max length", () => {
    expect(
      catalogBrowseInputSchema.safeParse({ search: "a".repeat(101) }).success,
    ).toBe(false);
  });

  it("rejects a search string with control characters", () => {
    expect(
      catalogBrowseInputSchema.safeParse({ search: "test\x00string" }).success,
    ).toBe(false);
  });
});

describe("catalogListOutputSchema", () => {
  it("accepts an empty array", () => {
    expect(catalogListOutputSchema.parse([])).toEqual([]);
  });

  it("accepts a fully-shaped grouped catalog payload", () => {
    const payload = [
      {
        brand: "Hermes",
        productLine: "Bolide",
        units: [
          {
            id: "11111111-1111-4111-8111-111111111111",
            brand: "Hermes",
            productLine: "Bolide",
            modelName: "Bolide 27",
          },
        ],
      },
    ];
    expect(catalogListOutputSchema.parse(payload)).toEqual(payload);
  });

  it("rejects a unit with a non-uuid id", () => {
    const payload = [
      {
        brand: "Hermes",
        productLine: "Bolide",
        units: [
          {
            id: "not-a-uuid",
            brand: "Hermes",
            productLine: "Bolide",
            modelName: "Bolide 27",
          },
        ],
      },
    ];
    expect(catalogListOutputSchema.safeParse(payload).success).toBe(false);
  });

  it("rejects a group missing the units array", () => {
    const payload = [{ brand: "Hermes", productLine: "Bolide" }];
    expect(catalogListOutputSchema.safeParse(payload).success).toBe(false);
  });
});
