---
"@stock-tracker/subgraph-tracker": patch
"@stock-tracker/router": patch
"@stock-tracker/prisma": patch
---

Fix apiHandle leak in subgraph test helpers; activate Rhai plugin in router config with corrected JWT claims context key and remove duplicate YAML header injection; align init migration FK to reference auth_users.supabase_id.
