---
"@stock-tracker/mobile": minor
---

Ship `tracker/alertHistory/browse` Shengsho-style chronological drop-event list resolved against the live protected `alertHistory` GraphQL query (INF-1479). Includes row/empty/skeleton views, Storybook stories, and Maestro flow. Renames the History tab nav label to "내역" and adds a `teal` token (#009E99) for the soldOut left-indicator bar per the design hand-off. The view-layer `*.mock.ts` fixture is kept for Storybook + view-layer tests.
