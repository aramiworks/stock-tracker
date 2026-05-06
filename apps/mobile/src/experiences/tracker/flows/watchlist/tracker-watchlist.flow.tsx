import { memo } from "react";
import { TrackerWatchlistModels } from "./models";
import { TrackerWatchlistControllers } from "./controllers";
import { TrackerWatchlistViews } from "./views";

export const TrackerWatchlistFlow = memo(() => {
  return (
    <TrackerWatchlistModels>
      <TrackerWatchlistControllers>
        <TrackerWatchlistViews />
      </TrackerWatchlistControllers>
    </TrackerWatchlistModels>
  );
});

TrackerWatchlistFlow.displayName = "TrackerWatchlistFlow";
