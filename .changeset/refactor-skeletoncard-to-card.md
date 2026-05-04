---
"@stock-tracker/mobile": patch
---

Refactor TrackerSkeletonCardView to use Card atom (variant=filled). Drop fixed width/height props in favor of children-based composition; update wrappers and dashboard to compose internal skeleton bars matching real card shapes.
