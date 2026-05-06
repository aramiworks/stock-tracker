---
"@stock-tracker/mobile": patch
---

Fix analytics init failure leaving a permanently rejected promise; wrap all exported analytics functions in try/catch so errors never propagate to callers
