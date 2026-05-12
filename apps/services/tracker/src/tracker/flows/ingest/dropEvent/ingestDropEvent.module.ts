import { Module } from "@nestjs/common";
import { TrackerIngestDropEventModels } from "./models/index.js";
import { TrackerIngestDropEventControllers } from "./controllers/index.js";

@Module({
  providers: [TrackerIngestDropEventModels, TrackerIngestDropEventControllers],
  exports: [TrackerIngestDropEventControllers],
})
export class IngestDropEventModule {}
