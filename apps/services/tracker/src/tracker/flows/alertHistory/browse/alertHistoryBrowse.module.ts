import { Module } from "@nestjs/common";
import { TrackerAlertHistoryBrowseModels } from "./models/index.js";
import { TrackerAlertHistoryBrowseControllers } from "./controllers/index.js";

@Module({
  providers: [
    TrackerAlertHistoryBrowseModels,
    TrackerAlertHistoryBrowseControllers,
  ],
  exports: [TrackerAlertHistoryBrowseControllers],
})
export class AlertHistoryBrowseModule {}
