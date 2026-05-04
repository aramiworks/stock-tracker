import { Injectable } from "@nestjs/common";
import type { Prisma } from "@stock-tracker/prisma";
import { PrismaService } from "@stock-tracker/nestjs-common";

@Injectable()
export class TrackerCatalogBrowseModels {
  constructor(private readonly prisma: PrismaService) {}

  findAll(params: {
    productLine?: string;
    search?: string;
    activeOnly: boolean;
  }) {
    const where: Prisma.watchable_unitsWhereInput = {};

    if (params.activeOnly) {
      where.active = true;
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
      orderBy: [{ product_line: "asc" }, { model_name: "asc" }],
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
}
