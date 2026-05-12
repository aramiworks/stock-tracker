import { Injectable } from "@nestjs/common";
import {
  TrpcBaseService,
  PrismaService,
  PinoLoggerService,
} from "@stock-tracker/nestjs-common";

@Injectable()
export class TrpcService extends TrpcBaseService {
  readonly serviceProcedure;

  constructor(prisma: PrismaService, logger: PinoLoggerService) {
    super(prisma, logger);

    const token = process.env["TRACKER_INGEST_SERVICE_TOKEN"];
    if (!token) {
      throw new Error(
        "TRACKER_INGEST_SERVICE_TOKEN must be set for service-to-service auth",
      );
    }
    this.serviceProcedure = this.buildServiceProcedure(token);
  }
}
