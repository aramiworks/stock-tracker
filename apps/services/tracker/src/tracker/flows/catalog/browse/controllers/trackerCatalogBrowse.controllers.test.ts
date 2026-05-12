import { describe, expect, it, jest } from "@jest/globals";
import { TrackerCatalogBrowseControllers } from "./trackerCatalogBrowse.controllers.js";
import type { TrackerCatalogBrowseModels } from "../models/trackerCatalogBrowse.models.js";

type UnitRow = {
  id: string;
  brand: string;
  product_line: string;
  model_name: string;
};

function createControllers(rows: UnitRow[]) {
  const models = {
    findAllActive: jest.fn(async () => rows),
  } as unknown as TrackerCatalogBrowseModels;
  return new TrackerCatalogBrowseControllers(models);
}

describe("TrackerCatalogBrowseControllers.listGrouped", () => {
  it("groups units by (brand, product_line) preserving Prisma sort order", async () => {
    // Prisma returns rows already sorted by brand → product_line → model_name.
    const rows: UnitRow[] = [
      {
        id: "u1",
        brand: "Cartier",
        product_line: "Tank Must",
        model_name: "Tank Must Large",
      },
      {
        id: "u2",
        brand: "Cartier",
        product_line: "Tank Must",
        model_name: "Tank Must Small",
      },
      {
        id: "u3",
        brand: "Hermes",
        product_line: "Bolide",
        model_name: "Bolide 27",
      },
      {
        id: "u4",
        brand: "Hermes",
        product_line: "Bolide",
        model_name: "Bolide 31",
      },
      {
        id: "u5",
        brand: "Hermes",
        product_line: "Evelyne",
        model_name: "Evelyne III",
      },
    ];
    const controllers = createControllers(rows);

    const result = await controllers.listGrouped();

    expect(result).toEqual([
      {
        brand: "Cartier",
        productLine: "Tank Must",
        units: [
          {
            id: "u1",
            brand: "Cartier",
            productLine: "Tank Must",
            modelName: "Tank Must Large",
          },
          {
            id: "u2",
            brand: "Cartier",
            productLine: "Tank Must",
            modelName: "Tank Must Small",
          },
        ],
      },
      {
        brand: "Hermes",
        productLine: "Bolide",
        units: [
          {
            id: "u3",
            brand: "Hermes",
            productLine: "Bolide",
            modelName: "Bolide 27",
          },
          {
            id: "u4",
            brand: "Hermes",
            productLine: "Bolide",
            modelName: "Bolide 31",
          },
        ],
      },
      {
        brand: "Hermes",
        productLine: "Evelyne",
        units: [
          {
            id: "u5",
            brand: "Hermes",
            productLine: "Evelyne",
            modelName: "Evelyne III",
          },
        ],
      },
    ]);
  });

  it("returns an empty array when there are no active units", async () => {
    const controllers = createControllers([]);
    const result = await controllers.listGrouped();
    expect(result).toEqual([]);
  });

  it("produces a single group when all units share brand+product_line", async () => {
    const rows: UnitRow[] = [
      {
        id: "u1",
        brand: "Hermes",
        product_line: "Bolide",
        model_name: "Bolide 27",
      },
      {
        id: "u2",
        brand: "Hermes",
        product_line: "Bolide",
        model_name: "Bolide 31",
      },
    ];
    const controllers = createControllers(rows);
    const result = await controllers.listGrouped();

    expect(result).toHaveLength(1);
    expect(result[0]!.units).toHaveLength(2);
    expect(result[0]!.units.map((u) => u.modelName)).toEqual([
      "Bolide 27",
      "Bolide 31",
    ]);
  });

  it("starts a new group when product_line changes within the same brand", async () => {
    const rows: UnitRow[] = [
      {
        id: "u1",
        brand: "Hermes",
        product_line: "Bolide",
        model_name: "Bolide 27",
      },
      {
        id: "u2",
        brand: "Hermes",
        product_line: "Evelyne",
        model_name: "Evelyne III",
      },
    ];
    const controllers = createControllers(rows);
    const result = await controllers.listGrouped();

    expect(result.map((g) => g.productLine)).toEqual(["Bolide", "Evelyne"]);
  });
});
