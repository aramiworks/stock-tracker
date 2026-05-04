---
"@stock-tracker/subgraph-tracker": minor
"@stock-tracker/subgraph-auth": minor
---

Split the single Apollo subgraph into two domain-aligned subgraphs: `subgraph-auth` (User entity, identity, port 4002 prod / 4013 dev) and `subgraph-tracker` (Account, Purchase, port 4001 prod / 4011 dev). Each is independently buildable, deployable, and publishable to the Apollo registry. Cross-domain `User` references continue to work via the existing `@key(fields: "id")` federation entity.
