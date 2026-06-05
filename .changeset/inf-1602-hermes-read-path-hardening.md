---
"@stock-tracker/scraper": patch
---

Harden the Hermès read path: force HTTP/1.1 on the proxied GETs so DataDome challenges are parseable, implement the JSON-LD availability parser, and env-gate the inline CapSolver solve into the Hermès poll task.
