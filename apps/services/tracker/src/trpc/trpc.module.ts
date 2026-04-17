import { Module } from "@nestjs/common";
import { TrackerModule } from "../tracker/tracker.module.js";
import { TrpcService } from "./trpc.service.js";
import { TrpcRouter } from "./trpc.router.js";

@Module({
  imports: [TrackerModule],
  providers: [TrpcService, TrpcRouter],
  exports: [TrpcRouter],
})
export class TrpcModule {}
