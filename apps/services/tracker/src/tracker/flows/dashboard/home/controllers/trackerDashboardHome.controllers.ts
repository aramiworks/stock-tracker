import { Injectable } from "@nestjs/common";
import { TrackerDashboardHomeModels } from "../models/index.js";

@Injectable()
export class TrackerDashboardHomeControllers {
  constructor(private readonly models: TrackerDashboardHomeModels) {}

  async summary(userId: string) {
    const [totalAccounts, totalPurchases, totalSpentDecimal] =
      await Promise.all([
        this.models.getAccountCount(userId),
        this.models.getPurchaseCount(userId),
        this.models.getTotalSpent(userId),
      ]);

    return {
      totalAccounts,
      totalPurchases,
      totalSpent: totalSpentDecimal?.toString() ?? "0",
    };
  }
}
