import { Injectable } from "@nestjs/common";
import type { Prisma } from "@stock-tracker/prisma";
import { PrismaService } from "@stock-tracker/nestjs-common";

@Injectable()
export class TrackerHistoryBrowseModels {
  constructor(private readonly prisma: PrismaService) {}

  list(params: {
    userId: string;
    accountId?: string;
    cursor?: string;
    limit: number;
    sortOrder: "asc" | "desc";
    dateRange?: { from?: string; to?: string };
    amountRange?: { min?: number; max?: number };
    itemCategory?: string;
    search?: string;
  }) {
    const trackerAccountWhere: Prisma.tracker_accountsWhereInput = {
      auth_user_id: params.userId,
    };

    const where: Prisma.tracker_purchasesWhereInput = {
      tracker_account: trackerAccountWhere,
    };

    if (params.search) {
      where.item_name = { contains: params.search, mode: "insensitive" };
    }

    if (params.accountId) {
      where.tracker_account_id = params.accountId;
    }
    if (params.dateRange?.from || params.dateRange?.to) {
      where.purchase_date = {
        ...(params.dateRange.from && { gte: new Date(params.dateRange.from) }),
        ...(params.dateRange.to && {
          lte: new Date(params.dateRange.to + "T23:59:59.999Z"),
        }),
      };
    }
    if (
      params.amountRange?.min !== undefined ||
      params.amountRange?.max !== undefined
    ) {
      where.amount = {
        ...(params.amountRange?.min !== undefined && {
          gte: params.amountRange.min,
        }),
        ...(params.amountRange?.max !== undefined && {
          lte: params.amountRange.max,
        }),
      };
    }
    if (params.itemCategory) {
      where.item_category = params.itemCategory;
    }

    return this.prisma.tracker_purchases.findMany({
      where,
      include: {
        tracker_account: {
          select: { id: true, store_name: true },
        },
      },
      orderBy: { purchase_date: params.sortOrder },
      take: params.limit + 1,
      ...(params.cursor && {
        cursor: { id: params.cursor },
        skip: 1,
      }),
    });
  }
}
