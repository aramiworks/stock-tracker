import { Module } from "@nestjs/common";
import { TrackerPurchasesManageModels } from "./models/index.js";
import { TrackerPurchasesManageControllers } from "./controllers/index.js";

@Module({
  providers: [TrackerPurchasesManageModels, TrackerPurchasesManageControllers],
  exports: [TrackerPurchasesManageControllers],
})
export class PurchasesManageModule {}
