import { Module } from "@nestjs/common";
import { TrackerCatalogBrowseModels } from "./models/index.js";
import { TrackerCatalogBrowseControllers } from "./controllers/index.js";

@Module({
  providers: [TrackerCatalogBrowseModels, TrackerCatalogBrowseControllers],
  exports: [TrackerCatalogBrowseControllers],
})
export class CatalogBrowseModule {}
