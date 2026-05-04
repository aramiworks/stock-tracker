---
"@stock-tracker/config": patch
---

Allow `claude-arami[bot]` to trigger Claude Code in `claude.yml`. The `actions-cool/check-user-permission` action returns false for GitHub App bot identities (they don't appear as collaborators with explicit write permission), so the auto-resolve-conflicts workflow's `@claude` comments were silently rejected. Adding a bot allowlist bypass fixes conflict auto-resolution.
