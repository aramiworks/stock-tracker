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
    LoggerModule.forService("auth-service"),
    HealthModule,
    TrpcModule,
  ],
})
export class AppModule {}
