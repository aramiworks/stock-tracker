import { Injectable } from "@nestjs/common";
import { PrismaService } from "@stock-tracker/nestjs-common";

@Injectable()
export class TrackerAlertsFeedModels {
  constructor(private readonly prisma: PrismaService) {}

  findForUser(params: {
    userId: string;
    cursor?: string;
    limit: number;
    unreadOnly: boolean;
  }) {
    return this.prisma.alerts.findMany({
      where: {
        watch: { auth_user_id: params.userId },
        ...(params.unreadOnly && { read_at: null }),
      },
      include: {
        drop_event: true,
      },
      orderBy: { created_at: "desc" },
      take: params.limit + 1,
      ...(params.cursor && {
        cursor: { id: params.cursor },
        skip: 1,
      }),
    });
  }

  markRead(id: string) {
    return this.prisma.alerts.update({
      where: { id },
      data: { read_at: new Date() },
    });
  }

  countUnread(userId: string) {
    return this.prisma.alerts.count({
      where: {
        watch: { auth_user_id: userId },
        read_at: null,
      },
    });
  }
}
