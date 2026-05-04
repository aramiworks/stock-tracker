---
"@stock-tracker/subgraph-tracker": minor
---

Add Sentry error tracking to tracker-subgraph via Apollo plugin. GraphQL errors are captured with the operation name, requestId, and userId — sharing the requestId with upstream tRPC services lets you correlate errors across both Sentry projects.
