import { Module } from "@nestjs/common";
import { TrackerHistoryBrowseModels } from "./models/index.js";
import { TrackerHistoryBrowseControllers } from "./controllers/index.js";

@Module({
  providers: [TrackerHistoryBrowseModels, TrackerHistoryBrowseControllers],
  exports: [TrackerHistoryBrowseControllers],
})
export class HistoryBrowseModule {}
