import {
  memo,
  createContext,
  useContext,
  useCallback,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "expo-router";
import { WATCHLIST_DETAIL_MOCK } from "../models/tracker-watchlist-detail.mock";
import type {
  TrackerWatchlistDetailControllersOutput,
  TrackerWatchlistDetailScreenState,
  WatchlistDetailPayload,
} from "../models/tracker-watchlist-detail.type";
import { useTrackerWatchlistDetailLifecycle } from "../lifecycles/tracker-watchlist-detail.lifecycles";

const ControllersContext =
  createContext<TrackerWatchlistDetailControllersOutput | null>(null);

interface TrackerWatchlistDetailControllersProps {
  /** Watchable-unit ID from the dynamic route (`/watchlist/[id]`). */
  watchableUnitId: string;
  children: ReactNode;
}

export const TrackerWatchlistDetailControllers =
  memo<TrackerWatchlistDetailControllersProps>(
    ({ watchableUnitId, children }) => {
      const router = useRouter();
      const [refreshTick, setRefreshTick] = useState(0);

      // TODO(INF-1415): Replace mock with
      //   useSuspenseQuery(WATCHLIST_DETAIL_QUERY, { variables: { watchableUnitId } })
      const payload = useMemo<WatchlistDetailPayload | null>(() => {
        void refreshTick;
        return WATCHLIST_DETAIL_MOCK[watchableUnitId] ?? null;
      }, [watchableUnitId, refreshTick]);

      const refetch = useCallback(() => {
        setRefreshTick((t) => t + 1);
      }, []);

      useTrackerWatchlistDetailLifecycle(refetch);

      const onBack = useCallback(() => {
        if (router.canGoBack()) {
          router.back();
        } else {
          router.push("/tracker/watchlist");
        }
      }, [router]);

      const screenState: TrackerWatchlistDetailScreenState = payload
        ? "default"
        : "error";

      const value: TrackerWatchlistDetailControllersOutput = {
        screenState,
        payload,
        onBack,
      };

      return (
        <ControllersContext.Provider value={value}>
          {children}
        </ControllersContext.Provider>
      );
    },
  );

TrackerWatchlistDetailControllers.displayName =
  "TrackerWatchlistDetailControllers";

export const useTrackerWatchlistDetailControllers = () => {
  const context = useContext(ControllersContext);
  /* istanbul ignore next -- defensive guard */
  if (!context) {
    throw new Error(
      "useTrackerWatchlistDetailControllers must be used within TrackerWatchlistDetailControllers",
    );
  }
  return context;
};
