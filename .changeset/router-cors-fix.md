---
"@stock-tracker/router": patch
---

Fix CORS config: replace invalid `cors.policies` wrapper with flat `cors.origins`, and rename `ALLOWED_ORIGINS` (which expanded to a comma-separated string) to `CORS_ORIGIN` (must be a single URL).
