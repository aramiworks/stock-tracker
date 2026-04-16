import { Injectable } from "@nestjs/common";
import type { Prisma } from "@stock-tracker/prisma";
import { PrismaService } from "@stock-tracker/nestjs-common";

@Injectable()
export class TrackerAccountsListModels {
  constructor(private readonly prisma: PrismaService) {}

  findAll(params: {
    userId: string;
    sortBy: "store_name" | "created_at";
    sortOrder: "asc" | "desc";
    search?: string;
  }) {
    const where: Prisma.tracker_accountsWhereInput = {
      auth_user_id: params.userId,
    };
    if (params.search) {
      where.store_name = { contains: params.search, mode: "insensitive" };
    }

    return this.prisma.tracker_accounts.findMany({
      where,
      orderBy: { [params.sortBy]: params.sortOrder },
    });
  }

  create(data: {
    authUserId: string;
    storeName: string;
    saName?: string;
    notes?: string;
  }) {
    return this.prisma.tracker_accounts.create({
      data: {
        auth_user_id: data.authUserId,
        store_name: data.storeName,
        sa_name: data.saName,
        notes: data.notes,
      },
    });
  }
}
