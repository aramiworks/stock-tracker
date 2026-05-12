import { Injectable } from "@nestjs/common";
import type { Prisma } from "@stock-tracker/prisma";
import { PrismaService } from "@stock-tracker/nestjs-common";

@Injectable()
export class TrackerCatalogBrowseModels {
  constructor(private readonly prisma: PrismaService) {}

  findAll(params: {
    brand?: string;
    productLine?: string;
    search?: string;
    activeOnly: boolean;
    cursor?: string;
    limit: number;
  }) {
    const where: Prisma.watchable_unitsWhereInput = {};

    if (params.activeOnly) {
      where.active = true;
    }
    if (params.brand) {
      where.brand = params.brand;
    }
    if (params.productLine) {
      where.product_line = params.productLine;
    }
    if (params.search) {
      where.model_name = { contains: params.search, mode: "insensitive" };
    }

    return this.prisma.watchable_units.findMany({
      where,
      include: {
        skus: {
          where: params.activeOnly ? { active: true } : undefined,
          orderBy: { color: "asc" },
        },
      },
      orderBy: [
        { brand: "asc" },
        { product_line: "asc" },
        { model_name: "asc" },
      ],
      take: params.limit + 1,
      ...(params.cursor && {
        cursor: { id: params.cursor },
        skip: 1,
      }),
    });
  }

  findById(id: string) {
    return this.prisma.watchable_units.findUnique({
      where: { id },
      include: {
        skus: { orderBy: { color: "asc" } },
      },
    });
  }

  /**
   * Returns all active watchable units, ordered by brand → product_line →
   * model_name. The minimal shape (no SKUs, no timestamps) is what the
   * Shengsho-style catalog browse UI needs to render the grouped grid; the
   * caller is responsible for grouping by product_line.
   */
  findAllActive() {
    return this.prisma.watchable_units.findMany({
      where: { active: true },
      select: {
        id: true,
        brand: true,
        product_line: true,
        model_name: true,
      },
      orderBy: [
        { brand: "asc" },
        { product_line: "asc" },
        { model_name: "asc" },
      ],
    });
  }
}
