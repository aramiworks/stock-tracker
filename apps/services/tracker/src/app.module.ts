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
    LoggerModule.forService("tracker-service"),
    HealthModule,
    TrpcModule,
  ],
})
export class AppModule {}
