import {
  memo,
  createContext,
  useContext,
  useCallback,
  useMemo,
  useState,
  startTransition,
  type ReactNode,
} from "react";
import { useRouter } from "expo-router";
import { WATCHLIST_LIST_MOCK_GROUPS } from "../models/tracker-watchlist-list.mock";
import type {
  WatchlistGroup,
  WatchlistEntry,
  TrackerWatchlistListControllersOutput,
  TrackerWatchlistListScreenState,
} from "../models/tracker-watchlist-list.type";
import { useTrackerWatchlistListLifecycle } from "../lifecycles/tracker-watchlist-list.lifecycles";

const ControllersContext =
  createContext<TrackerWatchlistListControllersOutput | null>(null);

interface TrackerWatchlistListControllersProps {
  children: ReactNode;
}

export const TrackerWatchlistListControllers =
  memo<TrackerWatchlistListControllersProps>(({ children }) => {
    const router = useRouter();
    const [isRefreshing, setIsRefreshing] = useState(false);
    // Bumping this state in onRefresh forces the memoised mock to re-resolve
    // and gives us a stable "refresh fired" hook for tests. Once INF-1415 lands
    // this becomes Apollo's `refetch()`.
    const [refreshTick, setRefreshTick] = useState(0);

    // TODO(INF-1415): Replace mock with `useSuspenseQuery(WATCHLIST_LIST_QUERY)`.
    const groups = useMemo<WatchlistGroup[]>(() => {
      void refreshTick;
      return WATCHLIST_LIST_MOCK_GROUPS;
    }, [refreshTick]);

    const refetch = useCallback(() => {
      setRefreshTick((t) => t + 1);
    }, []);

    useTrackerWatchlistListLifecycle(refetch);

    const onRefresh = useCallback(() => {
      setIsRefreshing(true);
      startTransition(() => {
        refetch();
        setIsRefreshing(false);
      });
    }, [refetch]);

    const onAddProductsPress = useCallback(() => {
      router.push("/tracker/catalog/browse");
    }, [router]);

    const onEntryPress = useCallback(
      (entry: WatchlistEntry) => {
        router.push({
          pathname: "/tracker/watchlist/[id]",
          params: { id: entry.watchableUnitId },
        });
      },
      [router],
    );

    const screenState: TrackerWatchlistListScreenState =
      groups.length > 0 ? "default" : "empty";

    const value: TrackerWatchlistListControllersOutput = {
      screenState,
      groups,
      isRefreshing,
      onRefresh,
      onAddProductsPress,
      onEntryPress,
    };

    return (
      <ControllersContext.Provider value={value}>
        {children}
      </ControllersContext.Provider>
    );
  });

TrackerWatchlistListControllers.displayName = "TrackerWatchlistListControllers";

export const useTrackerWatchlistListControllers = () => {
  const context = useContext(ControllersContext);
  /* istanbul ignore next -- defensive guard */
  if (!context) {
    throw new Error(
      "useTrackerWatchlistListControllers must be used within TrackerWatchlistListControllers",
    );
  }
  return context;
};
