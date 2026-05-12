import { Injectable } from "@nestjs/common";
import {
  TrpcBaseService,
  PrismaService,
  PinoLoggerService,
} from "@stock-tracker/nestjs-common";
import { TRPCError } from "@trpc/server";

@Injectable()
export class TrpcService extends TrpcBaseService {
  readonly serviceProcedure;

  constructor(prisma: PrismaService, logger: PinoLoggerService) {
    super(prisma, logger);

    const token = process.env["TRACKER_INGEST_SERVICE_TOKEN"];
    if (token) {
      this.serviceProcedure = this.buildServiceProcedure(token);
    } else {
      // In environments where the token isn't set (e.g. e2e tests),
      // create a procedure that always rejects.
      this.serviceProcedure = this.publicProcedure.use(async () => {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "TRACKER_INGEST_SERVICE_TOKEN not configured",
        });
      });
    }
  }
}
