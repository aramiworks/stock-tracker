---
"@stock-tracker/prisma": patch
---

Add forward migration `20260504000000_align_tracker_accounts_fk` that brings deployed databases in sync with INF-1235. INF-1235 changed the `tracker_accounts.auth_user_id` FK target from `auth_users.id` to `auth_users.supabase_id` by editing the init migration in place, so the deployed develop DB never received the ALTER. The migration is idempotent — it inspects `pg_constraint` and runs the FK swap + row backfill only when the FK still references `auth_users.id`. Re-enables full-stack e2e tests 4 and 5 (createAccount round-trip + ownership check) that were skipped pending this fix.
