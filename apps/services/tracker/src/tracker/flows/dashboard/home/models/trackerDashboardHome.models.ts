import { Injectable } from "@nestjs/common";
import { PrismaService } from "@stock-tracker/nestjs-common";

@Injectable()
export class TrackerDashboardHomeModels {
  constructor(private readonly prisma: PrismaService) {}

  getActiveWatchCount(userId: string) {
    return this.prisma.watches.count({
      where: { auth_user_id: userId, active: true },
    });
  }

  getUnreadAlertCount(userId: string) {
    return this.prisma.alerts.count({
      where: {
        watch: { auth_user_id: userId },
        read_at: null,
      },
    });
  }

  getRecentDropCount(userId: string) {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return this.prisma.drop_events.count({
      where: {
        detected_at: { gte: oneDayAgo },
        sku: {
          watches: {
            some: { auth_user_id: userId, active: true },
          },
        },
      },
    });
  }
}
