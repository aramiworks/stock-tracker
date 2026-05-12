import { Module } from "@nestjs/common";
import { DashboardHomeModule } from "./flows/dashboard/home/dashboardHome.module.js";
import { CatalogBrowseModule } from "./flows/catalog/browse/catalogBrowse.module.js";
import { WatchlistManageModule } from "./flows/watchlist/manage/watchlistManage.module.js";
import { AlertsFeedModule } from "./flows/alerts/feed/alertsFeed.module.js";

@Module({
  imports: [
    DashboardHomeModule,
    CatalogBrowseModule,
    WatchlistManageModule,
    AlertsFeedModule,
  ],
  exports: [
    DashboardHomeModule,
    CatalogBrowseModule,
    WatchlistManageModule,
    AlertsFeedModule,
  ],
})
export class TrackerModule {}
