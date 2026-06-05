import { Injectable } from "@nestjs/common";
import { TrackerNotificationsDevicesModels } from "../models/index.js";

@Injectable()
export class TrackerNotificationsDevicesControllers {
  constructor(private readonly models: TrackerNotificationsDevicesModels) {}

  /**
   * Register the calling user's device push token. Idempotent — upserts on the
   * Expo token (see models.registerDevice for hand-off semantics).
   */
  async register(
    input: { expoToken: string; platform: string },
    userId: string,
  ) {
    await this.models.registerDevice({
      userId,
      expoToken: input.expoToken,
      platform: input.platform,
    });
    return { registered: true as const };
  }

  /**
   * Deactivate the calling user's device token on logout. `unregistered` is
   * false when the token wasn't an active row owned by this user (idempotent).
   */
  async unregister(input: { expoToken: string }, userId: string) {
    const result = await this.models.deactivateDevice({
      userId,
      expoToken: input.expoToken,
    });
    return { unregistered: result.count > 0 };
  }
}
