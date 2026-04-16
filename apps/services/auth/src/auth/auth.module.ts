import { Module } from "@nestjs/common";
import { AuthModels } from "./models/index.js";
import { AuthControllers } from "./controllers/index.js";

@Module({
  providers: [AuthModels, AuthControllers],
  exports: [AuthControllers],
})
export class AuthModule {}
