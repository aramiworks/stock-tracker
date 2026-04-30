---
"@stock-tracker/mobile": patch
"@stock-tracker/subgraph-tracker": patch
"@stock-tracker/auth-service": patch
---

Fix createAccount FK failure by syncing auth_users on sign-in. auth_users.id is now set to the Supabase UUID so tracker_accounts.auth_user_id resolves correctly. Adds upsertUser GraphQL mutation called after sign-in to create the profile record.
