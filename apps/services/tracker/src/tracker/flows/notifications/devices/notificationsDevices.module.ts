import { Module } from "@nestjs/common";
import { TrackerNotificationsDevicesModels } from "./models/index.js";
import { TrackerNotificationsDevicesControllers } from "./controllers/index.js";

@Module({
  providers: [
    TrackerNotificationsDevicesModels,
    TrackerNotificationsDevicesControllers,
  ],
  exports: [TrackerNotificationsDevicesControllers],
})
export class NotificationsDevicesModule {}
