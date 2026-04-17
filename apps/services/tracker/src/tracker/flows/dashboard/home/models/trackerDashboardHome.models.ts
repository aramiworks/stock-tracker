import { Injectable } from "@nestjs/common";
import { PrismaService } from "@stock-tracker/nestjs-common";

@Injectable()
export class TrackerDashboardHomeModels {
  constructor(private readonly prisma: PrismaService) {}

  getAccountCount(userId: string) {
    return this.prisma.tracker_accounts.count({
      where: { auth_user_id: userId },
    });
  }

  getPurchaseCount(userId: string) {
    return this.prisma.tracker_purchases.count({
      where: { tracker_account: { auth_user_id: userId } },
    });
  }

  async getTotalSpent(userId: string) {
    const result = await this.prisma.tracker_purchases.aggregate({
      where: { tracker_account: { auth_user_id: userId } },
      _sum: { amount: true },
    });
    return result._sum.amount;
  }
}
