---
"@stock-tracker/push": minor
"@stock-tracker/tracker-service": minor
---

Add the framework-agnostic `@stock-tracker/push` Expo client (`sendExpoPush` with 100-msg chunking, ticket→token alignment, and `DeviceNotRegistered` mapping) plus the Korean `buildRestockNotification` copy builder, and wire inline Expo push dispatch into the drop-event ingest controller (load pending push alerts → send → stamp `sent_at` / deactivate dead tokens, never failing the ingest mutation on dispatch error).
