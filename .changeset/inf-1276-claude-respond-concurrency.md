---
"@stock-tracker/mobile": patch
---

Adjust `claude-respond.yml` concurrency: drop unused `pull_request` triggers and set `cancel-in-progress: false` so back-to-back PR-review-response runs queue instead of cancelling each other.
