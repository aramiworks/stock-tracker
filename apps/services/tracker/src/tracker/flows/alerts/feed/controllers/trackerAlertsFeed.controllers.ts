import { Injectable } from "@nestjs/common";
import { TrackerAlertsFeedModels } from "../models/index.js";

type AlertWithDropEvent = Awaited<
  ReturnType<TrackerAlertsFeedModels["findForUser"]>
>[number];

const mapAlert = (a: AlertWithDropEvent) => ({
  id: a.id,
  watchId: a.watch_id,
  dropEventId: a.drop_event_id,
  channel: a.channel,
  sentAt: a.sent_at,
  readAt: a.read_at,
  createdAt: a.created_at,
  dropEvent: {
    id: a.drop_event.id,
    skuId: a.drop_event.sku_id,
    sourceUrl: a.drop_event.source_url,
    detectedAt: a.drop_event.detected_at,
  },
});

@Injectable()
export class TrackerAlertsFeedControllers {
  constructor(private readonly models: TrackerAlertsFeedModels) {}

  async list(
    input: {
      cursor?: string;
      limit: number;
      unreadOnly: boolean;
    },
    userId: string,
  ) {
    const results = await this.models.findForUser({ ...input, userId });

    let nextCursor: string | null = null;
    if (results.length > input.limit) {
      const nextItem = results.pop()!;
      nextCursor = nextItem.id;
    }

    return {
      items: results.map(mapAlert),
      nextCursor,
    };
  }

  async markRead(input: { id: string }) {
    await this.models.markRead(input.id);
    return { success: true as const };
  }

  async unreadCount(userId: string) {
    const count = await this.models.countUnread(userId);
    return { count };
  }
}
