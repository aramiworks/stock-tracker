import { Injectable } from "@nestjs/common";
import {
  TrpcBaseService,
  PrismaService,
  PinoLoggerService,
} from "@stock-tracker/nestjs-common";

@Injectable()
export class TrpcService extends TrpcBaseService {
  constructor(prisma: PrismaService, logger: PinoLoggerService) {
    super(prisma, logger);
  }
}
