---
"@stock-tracker/storybook": patch
---

Collapse the duplicated `config.define = {...}` block in `apps/storybook/.storybook/main.ts` that landed via the INF-1552 squash merge. Restores `format:check`, `lint`, and `build` on every open PR.
