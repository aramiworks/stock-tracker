import { Injectable } from "@nestjs/common";
import { PrismaService } from "@stock-tracker/nestjs-common";

@Injectable()
export class TrackerAccountsDetailModels {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: string) {
    return this.prisma.tracker_accounts.findUnique({
      where: { id },
      include: { tracker_purchases: { orderBy: { purchase_date: "desc" } } },
    });
  }

  update(
    id: string,
    data: {
      store_name?: string;
      sa_name?: string | null;
      notes?: string | null;
    },
  ) {
    return this.prisma.tracker_accounts.update({ where: { id }, data });
  }

  delete(id: string) {
    return this.prisma.tracker_accounts.delete({ where: { id } });
  }
}
