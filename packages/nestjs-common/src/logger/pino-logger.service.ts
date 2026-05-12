import { Injectable, LoggerService } from "@nestjs/common";
import { createLogger, type Logger } from "@stock-tracker/config";

@Injectable()
export class PinoLoggerService implements LoggerService {
  private readonly logger: Logger;

  constructor(
    service: string,
    betterStack?: { token?: string; ingestHost?: string },
  ) {
    this.logger = createLogger({
      service,
      betterStackToken: betterStack?.token,
      betterStackIngestHost: betterStack?.ingestHost,
    });
  }

  log(message: string, context?: string) {
    this.logger.info({ context }, message);
  }

  error(message: string, trace?: string, context?: string) {
    this.logger.error({ context, trace }, message);
  }

  warn(message: string, context?: string) {
    this.logger.warn({ context }, message);
  }

  debug(message: string, context?: string) {
    this.logger.debug({ context }, message);
  }

  verbose(message: string, context?: string) {
    this.logger.trace({ context }, message);
  }

  /** Expose the raw pino logger for tRPC middleware and other non-NestJS code. */
  getRawLogger(): Logger {
    return this.logger;
  }
}
