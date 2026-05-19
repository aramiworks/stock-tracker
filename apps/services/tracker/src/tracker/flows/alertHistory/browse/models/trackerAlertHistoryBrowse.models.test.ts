import { describe, expect, it, jest } from "@jest/globals";
import { TrackerAlertHistoryBrowseModels } from "./trackerAlertHistoryBrowse.models.js";
import type { PrismaService } from "@stock-tracker/nestjs-common";

type FindManyArgs = {
  where: Record<string, unknown>;
  include: unknown;
  orderBy: Record<string, "asc" | "desc">;
  take: number;
};

function createModels(rows: unknown[] = []) {
  const findMany = jest.fn(async (_args: FindManyArgs) => rows);
  const prisma = {
    drop_events: { findMany },
  } as unknown as PrismaService;
  return { models: new TrackerAlertHistoryBrowseModels(prisma), findMany };
}

describe("TrackerAlertHistoryBrowseModels.findForUser", () => {
  it("orders by detected_at DESC and takes limit + 1 rows", async () => {
    const { models, findMany } = createModels([]);

    await models.findForUser({ userId: "u-1", limit: 20, cursor: null });

    const args = findMany.mock.calls[0]![0]!;
    expect(args.orderBy).toEqual({ detected_at: "desc" });
    expect(args.take).toBe(21);
  });

  it("scopes the OR clause to unit-level and SKU-level watches for the user", async () => {
    const { models, findMany } = createModels([]);

    await models.findForUser({ userId: "u-1", limit: 20, cursor: null });

    const args = findMany.mock.calls[0]![0]!;
    const or = (args.where as { OR: unknown[] }).OR;
    expect(or).toHaveLength(2);

    // Unit-level: sku.watchable_unit.watches.some({ auth_user_id, sku_id: null })
    const unitClause = or[0] as {
      sku: {
        watchable_unit: {
          watches: {
            some: {
              auth_user_id: string;
              active: boolean;
              sku_id: null;
            };
          };
        };
      };
    };
    expect(
      unitClause.sku.watchable_unit.watches.some.auth_user_id,
    ).toBe("u-1");
    expect(unitClause.sku.watchable_unit.watches.some.active).toBe(true);
    expect(unitClause.sku.watchable_unit.watches.some.sku_id).toBeNull();

    // SKU-level: sku.watches.some({ auth_user_id, active })
    const skuClause = or[1] as {
      sku: {
        watches: {
          some: { auth_user_id: string; active: boolean };
        };
      };
    };
    expect(skuClause.sku.watches.some.auth_user_id).toBe("u-1");
    expect(skuClause.sku.watches.some.active).toBe(true);
  });

  it("includes sku and watchable_unit so the controller can compose row labels", async () => {
    const { models, findMany } = createModels([]);

    await models.findForUser({ userId: "u-1", limit: 20, cursor: null });

    const args = findMany.mock.calls[0]![0]!;
    expect(args.include).toEqual({
      sku: { include: { watchable_unit: true } },
    });
  });

  it("omits the detected_at filter when cursor is null", async () => {
    const { models, findMany } = createModels([]);

    await models.findForUser({ userId: "u-1", limit: 20, cursor: null });

    const args = findMany.mock.calls[0]![0]!;
    expect((args.where as { detected_at?: unknown }).detected_at).toBeUndefined();
  });

  it("applies WHERE detected_at < cursor when cursor is provided", async () => {
    const { models, findMany } = createModels([]);
    const cursor = new Date("2025-05-01T00:00:00Z");

    await models.findForUser({ userId: "u-1", limit: 20, cursor });

    const args = findMany.mock.calls[0]![0]!;
    expect((args.where as { detected_at: { lt: Date } }).detected_at).toEqual({
      lt: cursor,
    });
  });

  it("returns whatever Prisma returns (model is a thin pass-through)", async () => {
    const rows = [{ id: "d-1" }, { id: "d-2" }];
    const { models } = createModels(rows);

    const result = await models.findForUser({
      userId: "u-1",
      limit: 20,
      cursor: null,
    });

    expect(result).toEqual(rows);
  });
});
