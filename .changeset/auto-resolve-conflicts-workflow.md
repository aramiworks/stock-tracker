---
"@stock-tracker/config": patch
---

Add `auto-resolve-conflicts.yml` workflow. Triggered after `Auto-update PR branches` completes; posts a `@claude` comment on any conflicting open PRs to request automatic rebase resolution. Sourced from `aramiworks/.github`.
