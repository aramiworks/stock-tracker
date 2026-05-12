import { Injectable } from "@nestjs/common";
import { TrackerDashboardHomeModels } from "../models/index.js";

@Injectable()
export class TrackerDashboardHomeControllers {
  constructor(private readonly models: TrackerDashboardHomeModels) {}

  async summary(userId: string) {
    const [activeWatches, unreadAlerts, recentDrops] = await Promise.all([
      this.models.getActiveWatchCount(userId),
      this.models.getUnreadAlertCount(userId),
      this.models.getRecentDropCount(userId),
    ]);

    return {
      activeWatches,
      unreadAlerts,
      recentDrops,
    };
  }
}
