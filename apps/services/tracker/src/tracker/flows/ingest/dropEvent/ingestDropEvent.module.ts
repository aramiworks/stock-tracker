import { Module } from "@nestjs/common";
import { TrackerIngestDropEventModels } from "./models/index.js";
import { TrackerIngestDropEventControllers } from "./controllers/index.js";
import { ExpoPushService } from "./lifecycles/index.js";

@Module({
  providers: [
    TrackerIngestDropEventModels,
    ExpoPushService,
    TrackerIngestDropEventControllers,
  ],
  exports: [TrackerIngestDropEventControllers],
})
export class IngestDropEventModule {}
