import { describe, expect, it, jest } from "@jest/globals";
import { TrackerCatalogBrowseModels } from "./trackerCatalogBrowse.models.js";
import type { PrismaService } from "@stock-tracker/nestjs-common";

type FindManyArgs = {
  where: { active?: boolean };
  select: Record<string, boolean>;
  orderBy: {
    brand?: "asc" | "desc";
    product_line?: "asc" | "desc";
    model_name?: "asc" | "desc";
  }[];
};

function createModels(rows: unknown[]) {
  const findMany = jest.fn(async (_args: FindManyArgs) => rows);
  const prisma = {
    watchable_units: { findMany },
  } as unknown as PrismaService;
  return { models: new TrackerCatalogBrowseModels(prisma), findMany };
}

describe("TrackerCatalogBrowseModels.findAllActive", () => {
  it("filters where active=true and selects only the minimal fields", async () => {
    const rows = [
      {
        id: "u1",
        brand: "Hermes",
        product_line: "Bolide",
        model_name: "Bolide 27",
      },
    ];
    const { models, findMany } = createModels(rows);

    const result = await models.findAllActive();

    expect(result).toEqual(rows);
    const args = findMany.mock.calls[0]![0]!;
    expect(args.where).toEqual({ active: true });
    expect(args.select).toEqual({
      id: true,
      brand: true,
      product_line: true,
      model_name: true,
    });
  });

  it("orders by brand → product_line → model_name (all ascending)", async () => {
    const { models, findMany } = createModels([]);
    await models.findAllActive();

    const args = findMany.mock.calls[0]![0]!;
    expect(args.orderBy).toEqual([
      { brand: "asc" },
      { product_line: "asc" },
      { model_name: "asc" },
    ]);
  });

  it("returns an empty array when Prisma returns no rows", async () => {
    const { models } = createModels([]);
    const result = await models.findAllActive();
    expect(result).toEqual([]);
  });
});
