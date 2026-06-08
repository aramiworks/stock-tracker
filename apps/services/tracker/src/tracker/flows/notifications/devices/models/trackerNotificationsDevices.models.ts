import { Injectable } from "@nestjs/common";
import { PrismaService } from "@stock-tracker/nestjs-common";

@Injectable()
export class TrackerNotificationsDevicesModels {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Register (or refresh) a device's Expo push token for a user. Upserts on the
   * globally-unique `expo_token`, which handles device hand-off: if the token
   * was previously registered to another user, `auth_user_id` is reassigned and
   * the row is reactivated. A re-register by the same user just bumps
   * `last_seen_at` and ensures `active=true`.
   */
  registerDevice(params: {
    userId: string;
    expoToken: string;
    platform: string;
  }) {
    return this.prisma.push_devices.upsert({
      where: { expo_token: params.expoToken },
      create: {
        auth_user_id: params.userId,
        expo_token: params.expoToken,
        platform: params.platform,
      },
      update: {
        auth_user_id: params.userId,
        platform: params.platform,
        active: true,
        last_seen_at: new Date(),
      },
    });
  }

  /**
   * Soft-deactivate a device token for the calling user (logout). Scoped to
   * `auth_user_id` so a user can only deactivate their own device. Idempotent:
   * returns the number of rows affected (0 when the token isn't theirs / gone).
   */
  deactivateDevice(params: { userId: string; expoToken: string }) {
    return this.prisma.push_devices.updateMany({
      where: {
        expo_token: params.expoToken,
        auth_user_id: params.userId,
        active: true,
      },
      data: { active: false },
    });
  }
}
