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
import type {
  AlertHistoryEvent,
  TrackerAlertHistoryBrowseControllersOutput,
  TrackerAlertHistoryBrowseScreenState,
} from "../models/tracker-alertHistory-browse.type";
import { ALERT_HISTORY_MOCK } from "../models/tracker-alertHistory-browse.mock";
import { useTrackerAlertHistoryBrowseLifecycle } from "../lifecycles/tracker-alertHistory-browse.lifecycles";

const ControllersContext =
  createContext<TrackerAlertHistoryBrowseControllersOutput | null>(null);

interface TrackerAlertHistoryBrowseControllersProps {
  children: ReactNode;
}

/**
 * Shengsho-style alert-history browse controllers.
 *
 * Resolves against the in-memory `ALERT_HISTORY_MOCK` fixture until INF-1479
 * lands the protected `alertHistory` GraphQL query. The follow-up agent will
 * swap the `useMemo` source for `useSuspenseQuery(ALERT_HISTORY_QUERY)` and
 * forward the Apollo `refetch` into the lifecycle hook — the rest of this
 * file's shape stays unchanged.
 *
 * Events are sorted newest-first by `detectedAt` (descending) so the row order
 * mirrors a chronological feed regardless of how the mock array is authored.
 */
export const TrackerAlertHistoryBrowseControllers =
  memo<TrackerAlertHistoryBrowseControllersProps>(({ children }) => {
    const router = useRouter();
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Mock-resolved source. Stable identity across renders so downstream
    // useMemo deps don't churn — replaced by `data?.alertHistory ?? []` once
    // INF-1479 wires the live query.
    const source = ALERT_HISTORY_MOCK;

    const refetch = useCallback(() => {
      // No-op while mock-resolved. INF-1479 will replace this with the Apollo
      // `refetch` returned from `useSuspenseQuery`.
      return Promise.resolve();
    }, []);

    useTrackerAlertHistoryBrowseLifecycle(refetch);

    const events = useMemo<AlertHistoryEvent[]>(() => {
      return [...source].sort((a, b) => {
        const aTime = new Date(a.detectedAt).getTime();
        const bTime = new Date(b.detectedAt).getTime();
        return bTime - aTime;
      });
    }, [source]);

    const onRefresh = useCallback(() => {
      setIsRefreshing(true);
      startTransition(() => {
        void refetch().finally(() => setIsRefreshing(false));
      });
    }, [refetch]);

    const onEventPress = useCallback(
      (event: AlertHistoryEvent) => {
        router.push({
          pathname: "/tracker/watchlist/[id]",
          params: { id: event.watchableUnitId },
        });
      },
      [router],
    );

    const screenState: TrackerAlertHistoryBrowseScreenState =
      events.length > 0 ? "default" : "empty";

    const value: TrackerAlertHistoryBrowseControllersOutput = {
      screenState,
      events,
      isRefreshing,
      onRefresh,
      onEventPress,
    };

    return (
      <ControllersContext.Provider value={value}>
        {children}
      </ControllersContext.Provider>
    );
  });

TrackerAlertHistoryBrowseControllers.displayName =
  "TrackerAlertHistoryBrowseControllers";

export const useTrackerAlertHistoryBrowseControllers = () => {
  const context = useContext(ControllersContext);
  /* istanbul ignore next -- defensive guard */
  if (!context) {
    throw new Error(
      "useTrackerAlertHistoryBrowseControllers must be used within TrackerAlertHistoryBrowseControllers",
    );
  }
  return context;
};
