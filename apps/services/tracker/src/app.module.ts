import { Module } from "@nestjs/common";
import {
  AppConfigModule,
  baseEnvSchema,
  PrismaModule,
  LoggerModule,
  HealthModule,
} from "@stock-tracker/nestjs-common";
import { TrpcModule } from "./trpc/trpc.module.js";

@Module({
  imports: [
    AppConfigModule.forSchema(baseEnvSchema),
    PrismaModule,
    LoggerModule.forService("tracker-service", {
      token: process.env["TRACKER_SERVICE_BETTER_STACK_SOURCE_TOKEN"],
      ingestHost: process.env["BETTER_STACK_INGEST_HOST"],
    }),
    HealthModule,
    TrpcModule,
  ],
})
export class AppModule {}
