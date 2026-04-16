import { Injectable } from "@nestjs/common";
import { PrismaService } from "@stock-tracker/nestjs-common";

@Injectable()
export class TrackerPurchasesManageModels {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: string) {
    return this.prisma.tracker_purchases.findUnique({
      where: { id },
      include: { tracker_account: true },
    });
  }

  findAccountById(id: string) {
    return this.prisma.tracker_accounts.findUnique({
      where: { id },
    });
  }

  create(data: {
    trackerAccountId: string;
    itemName: string;
    itemCategory?: string;
    amount: number;
    currency?: string;
    purchaseDate: Date;
    storeLocation?: string;
    notes?: string;
  }) {
    return this.prisma.tracker_purchases.create({
      data: {
        tracker_account_id: data.trackerAccountId,
        item_name: data.itemName,
        item_category: data.itemCategory,
        amount: data.amount,
        currency: data.currency,
        purchase_date: data.purchaseDate,
        store_location: data.storeLocation,
        notes: data.notes,
      },
    });
  }

  update(
    id: string,
    data: {
      item_name?: string;
      item_category?: string | null;
      amount?: number;
      currency?: string;
      purchase_date?: Date;
      store_location?: string | null;
      notes?: string | null;
    },
  ) {
    return this.prisma.tracker_purchases.update({ where: { id }, data });
  }

  delete(id: string) {
    return this.prisma.tracker_purchases.delete({ where: { id } });
  }
}
