---
"@stock-tracker/config": patch
---

Delete dead claude-respond.yml workflow — it only triggered on greptile-apps[bot] reviews, which can no longer happen since Greptile is uninstalled. The new claude-review.yml handles all PR review needs.
