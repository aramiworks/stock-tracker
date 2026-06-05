---
"@stock-tracker/mobile": patch
---

Apply the container-Overview + views/ Storybook convention across all stories: container stories now lead with an Overview (mandatory, first) covering every screen state; view stories move under a `/views/` title segment (no `.view` suffix) and drop their Overview (Overview is container-only). Shared views retitle to `tracker/views/*`, and the redundant `tracker/watchlist/detail.views` story folds into the container story.
