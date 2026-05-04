import { Module } from "@nestjs/common";
import { TrackerAlertsFeedModels } from "./models/index.js";
import { TrackerAlertsFeedControllers } from "./controllers/index.js";

@Module({
  providers: [TrackerAlertsFeedModels, TrackerAlertsFeedControllers],
  exports: [TrackerAlertsFeedControllers],
})
export class AlertsFeedModule {}
