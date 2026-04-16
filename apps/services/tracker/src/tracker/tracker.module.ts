import { Module } from "@nestjs/common";
import { DashboardHomeModule } from "./flows/dashboard/home/dashboardHome.module.js";
import { AccountsListModule } from "./flows/accounts/list/accountsList.module.js";
import { AccountsDetailModule } from "./flows/accounts/detail/accountsDetail.module.js";
import { HistoryBrowseModule } from "./flows/history/browse/historyBrowse.module.js";
import { PurchasesManageModule } from "./flows/purchases/manage/purchasesManage.module.js";

@Module({
  imports: [
    DashboardHomeModule,
    AccountsListModule,
    AccountsDetailModule,
    HistoryBrowseModule,
    PurchasesManageModule,
  ],
  exports: [
    DashboardHomeModule,
    AccountsListModule,
    AccountsDetailModule,
    HistoryBrowseModule,
    PurchasesManageModule,
  ],
})
export class TrackerModule {}
