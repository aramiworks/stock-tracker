import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module.js";
import { TrpcService } from "./trpc.service.js";
import { TrpcRouter } from "./trpc.router.js";

@Module({
  imports: [AuthModule],
  providers: [TrpcService, TrpcRouter],
  exports: [TrpcRouter],
})
export class TrpcModule {}
