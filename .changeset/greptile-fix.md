---
"@stock-tracker/subgraph-tracker": patch
"@stock-tracker/router": patch
"@stock-tracker/railway-infra": patch
"@stock-tracker/integration-tests-router": patch
---

Fix apiHandle leak in subgraph test helpers; activate Rhai plugin in router config with corrected JWT claims context key and remove duplicate YAML header injection; rename ALLOWED_ORIGINS → CORS_ORIGIN in Railway infra config and integration-test stack helper to match router.yaml.
