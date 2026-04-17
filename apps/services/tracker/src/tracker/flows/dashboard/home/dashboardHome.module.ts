import { Module } from "@nestjs/common";
import { TrackerDashboardHomeModels } from "./models/index.js";
import { TrackerDashboardHomeControllers } from "./controllers/index.js";

@Module({
  providers: [TrackerDashboardHomeModels, TrackerDashboardHomeControllers],
  exports: [TrackerDashboardHomeControllers],
})
export class DashboardHomeModule {}
