import { Module } from "@nestjs/common";
import { TrackerAccountsDetailModels } from "./models/index.js";
import { TrackerAccountsDetailControllers } from "./controllers/index.js";

@Module({
  providers: [TrackerAccountsDetailModels, TrackerAccountsDetailControllers],
  exports: [TrackerAccountsDetailControllers],
})
export class AccountsDetailModule {}
