import { Module } from "@nestjs/common";
import { TrackerAccountsListModels } from "./models/index.js";
import { TrackerAccountsListControllers } from "./controllers/index.js";

@Module({
  providers: [TrackerAccountsListModels, TrackerAccountsListControllers],
  exports: [TrackerAccountsListControllers],
})
export class AccountsListModule {}
