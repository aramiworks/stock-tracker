import { Module } from "@nestjs/common";
import { DashboardHomeModule } from "./flows/dashboard/home/dashboardHome.module.js";
import { CatalogBrowseModule } from "./flows/catalog/browse/catalogBrowse.module.js";
import { WatchlistManageModule } from "./flows/watchlist/manage/watchlistManage.module.js";
import { AlertsFeedModule } from "./flows/alerts/feed/alertsFeed.module.js";
import { AlertHistoryBrowseModule } from "./flows/alertHistory/browse/alertHistoryBrowse.module.js";
import { IngestDropEventModule } from "./flows/ingest/dropEvent/ingestDropEvent.module.js";
import { NotificationsDevicesModule } from "./flows/notifications/devices/notificationsDevices.module.js";

@Module({
  imports: [
    DashboardHomeModule,
    CatalogBrowseModule,
    WatchlistManageModule,
    AlertsFeedModule,
    AlertHistoryBrowseModule,
    IngestDropEventModule,
    NotificationsDevicesModule,
  ],
  exports: [
    DashboardHomeModule,
    CatalogBrowseModule,
    WatchlistManageModule,
    AlertsFeedModule,
    AlertHistoryBrowseModule,
    IngestDropEventModule,
    NotificationsDevicesModule,
  ],
})
export class TrackerModule {}
