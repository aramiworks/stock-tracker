---
"@stock-tracker/tracker-service": patch
---

Switch dev runner from tsx to node --loader ts-node/esm to fix NestJS constructor DI (emitDecoratorMetadata). Fix apiHandle leak when spawnTrackerTestServer fails in test helpers; suppress deprecated --loader ExperimentalWarning and remove unused tsx devDependency.
