---
"@stock-tracker/prisma": patch
---

Change tracker_accounts FK to reference auth_users.supabase_id so auth_user_id (Supabase JWT sub) resolves correctly.
