---
"@stock-tracker/mobile": minor
---

Add Shengsho-style `tracker/watchlist/list` + `tracker/watchlist/detail` containers. Watchlist tab now renders the new grouped list (state pills + relative timestamps) with a `+ 추가` entry into the catalog; tapping a row pushes a dynamic detail screen with hero, current-stock SKU rows, and a restock history section. Mock-resolved until INF-1415 wires real `watchlist.list` + `watchlist.detail` tRPC/GraphQL.
