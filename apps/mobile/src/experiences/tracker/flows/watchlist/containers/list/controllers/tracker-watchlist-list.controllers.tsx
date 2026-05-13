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
import { useSuspenseQuery } from "@apollo/client/react";
import { WATCHLIST_LIST_QUERY } from "@/lib/graphql/queries";
import type {
  WatchlistGroup,
  WatchlistEntry,
  WatchableState,
  TrackerWatchlistListControllersOutput,
  TrackerWatchlistListScreenState,
} from "../models/tracker-watchlist-list.type";
import { useTrackerWatchlistListLifecycle } from "../lifecycles/tracker-watchlist-list.lifecycles";

/**
 * GraphQL response shape for `query WatchlistList` (see
 * `apps/subgraphs/tracker/schema.graphql`). Hand-written because the mobile
 * codegen pipeline has pre-existing drift; once that drift is resolved we can
 * swap to `graphql(...)`-generated types. Mirrors the catalog/browse pattern
 * (see `tracker-catalog-browse.controllers.tsx`).
 */
interface WatchlistListQueryData {
  watchlist: Array<{
    brand: string;
    productLine: string;
    entries: Array<{
      id: string;
      watchableUnitId: string;
      brand: string;
      productLine: string;
      modelName: string;
      state: WatchableState;
      lastRestockedAt: string | null;
    }>;
  }>;
}

const ControllersContext =
  createContext<TrackerWatchlistListControllersOutput | null>(null);

interface TrackerWatchlistListControllersProps {
  children: ReactNode;
}

export const TrackerWatchlistListControllers =
  memo<TrackerWatchlistListControllersProps>(({ children }) => {
    const router = useRouter();
    const [isRefreshing, setIsRefreshing] = useState(false);

    const { data, refetch } =
      useSuspenseQuery<WatchlistListQueryData>(WATCHLIST_LIST_QUERY);

    useTrackerWatchlistListLifecycle(refetch);

    const groups = useMemo<WatchlistGroup[]>(
      // istanbul ignore next -- `useSuspenseQuery` always resolves data before
      // we render; the `?? []` guard is purely defensive against partial data.
      () => data?.watchlist ?? [],
      [data?.watchlist],
    );

    const onRefresh = useCallback(() => {
      setIsRefreshing(true);
      startTransition(() => {
        void refetch().finally(() => setIsRefreshing(false));
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
