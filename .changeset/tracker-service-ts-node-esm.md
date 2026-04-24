---
"@stock-tracker/tracker-service": patch
---

Switch dev runner from tsx to node --loader ts-node/esm to fix NestJS constructor DI (emitDecoratorMetadata).
