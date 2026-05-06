import { Injectable } from "@nestjs/common";
import { PrismaService } from "@stock-tracker/nestjs-common";

@Injectable()
export class TrackerWatchlistManageModels {
  constructor(private readonly prisma: PrismaService) {}

  findAllForUser(userId: string) {
    return this.prisma.watches.findMany({
      where: { auth_user_id: userId, active: true },
      include: {
        watchable_unit: true,
        sku: true,
      },
      orderBy: { created_at: "desc" },
    });
  }

  findById(id: string) {
    return this.prisma.watches.findUnique({
      where: { id },
      include: {
        watchable_unit: true,
        sku: true,
      },
    });
  }

  create(data: {
    authUserId: string;
    watchableUnitId: string;
    skuId?: string;
    notifyPush: boolean;
    notifyEmail: boolean;
  }) {
    return this.prisma.watches.create({
      data: {
        auth_user_id: data.authUserId,
        watchable_unit_id: data.watchableUnitId,
        sku_id: data.skuId,
        notify_push: data.notifyPush,
        notify_email: data.notifyEmail,
      },
      include: {
        watchable_unit: true,
        sku: true,
      },
    });
  }

  update(
    id: string,
    data: {
      notify_push?: boolean;
      notify_email?: boolean;
      active?: boolean;
    },
  ) {
    return this.prisma.watches.update({
      where: { id },
      data,
      include: {
        watchable_unit: true,
        sku: true,
      },
    });
  }

  delete(id: string) {
    return this.prisma.watches.delete({ where: { id } });
  }
}
