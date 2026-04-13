import { Global, Module } from "@nestjs/common";
import { PinoLoggerService } from "./pino-logger.service.js";

/**
 * Provides a NestJS LoggerService backed by pino.
 * Usage: LoggerModule.forService("auth-service")
 */
@Global()
@Module({})
export class LoggerModule {
  static forService(serviceName: string) {
    return {
      module: LoggerModule,
      providers: [
        {
          provide: PinoLoggerService,
          useFactory: () => new PinoLoggerService(serviceName),
        },
      ],
      exports: [PinoLoggerService],
    };
  }
}
