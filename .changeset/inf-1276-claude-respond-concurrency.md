---
"@stock-tracker/mobile": patch
---

Stop cancelling Greptile-response runs in `claude-respond.yml`: drop unused `pull_request` triggers (they only ever hit the `is_greptile=false` exit) and set `cancel-in-progress: false` so back-to-back Greptile reviews queue instead of cancelling each other.
