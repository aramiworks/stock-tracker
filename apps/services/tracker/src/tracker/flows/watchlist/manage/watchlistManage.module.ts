import { Module } from "@nestjs/common";
import { TrackerWatchlistManageModels } from "./models/index.js";
import { TrackerWatchlistManageControllers } from "./controllers/index.js";

@Module({
  providers: [TrackerWatchlistManageModels, TrackerWatchlistManageControllers],
  exports: [TrackerWatchlistManageControllers],
})
export class WatchlistManageModule {}
