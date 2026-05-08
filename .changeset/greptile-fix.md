---
"@stock-tracker/mobile": patch
---

Fix analytics init failure leaving a permanently rejected promise; wrap all exported analytics functions in try/catch so errors never propagate to callers. Move sign_in_succeeded tracking to after upsertUserProfile to prevent dual success/failure events on upsert failure.
