---
"@stock-tracker/config": patch
---

Delete the unreferenced `claude-respond.yml` workflow. Its only trigger (responding to the previous third-party PR-review bot) is no longer reachable; `claude-review.yml` covers the same surface.
