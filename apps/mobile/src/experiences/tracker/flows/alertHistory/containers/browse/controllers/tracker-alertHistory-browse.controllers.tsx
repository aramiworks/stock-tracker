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
import { useSuspenseQuery } from "@apollo/client/react";
import { ALERT_HISTORY_QUERY } from "@/lib/graphql/queries";
import type {
  AlertHistoryEvent,
  AlertHistoryEventKind,
  TrackerAlertHistoryBrowseControllersOutput,
  TrackerAlertHistoryBrowseScreenState,
} from "../models/tracker-alertHistory-browse.type";
import { useTrackerAlertHistoryBrowseLifecycle } from "../lifecycles/tracker-alertHistory-browse.lifecycles";

/**
 * GraphQL response shape for `query AlertHistory` (see
 * `apps/subgraphs/tracker/schema.graphql`). Hand-written because the mobile
 * codegen pipeline has pre-existing drift; once that drift is resolved we can
 * swap to `graphql(...)`-generated types. Mirrors the watchlist/list pattern
 * (see `tracker-watchlist-list.controllers.tsx`).
 *
 * Note `kind` is `string` on the wire — INF-1483 will tighten this to the
 * `restocked` | `soldOut` enum once the soldOut event source lands.
 */
interface AlertHistoryQueryData {
  alertHistory: {
    events: Array<{
      id: string;
      brand: string;
      productLine: string;
      modelName: string;
      skuDescriptor: string | null;
      kind: string;
      detectedAt: string;
    }>;
    nextCursor: string | null;
  };
}

const ControllersContext =
  createContext<TrackerAlertHistoryBrowseControllersOutput | null>(null);

interface TrackerAlertHistoryBrowseControllersProps {
  children: ReactNode;
}

/**
 * Shengsho-style alert-history browse controllers.
 *
 * Resolves against the live protected `alertHistory` GraphQL query landed by
 * INF-1479. The server returns events ordered newest-first by `detectedAt`, so
 * the controller forwards them through unsorted. The view layer's `*.mock.ts`
 * fixture is retained for Storybook + view-layer tests but no longer feeds the
 * runtime controller.
 */
export const TrackerAlertHistoryBrowseControllers =
  memo<TrackerAlertHistoryBrowseControllersProps>(({ children }) => {
    const [isRefreshing, setIsRefreshing] = useState(false);

    const { data, refetch } = useSuspenseQuery<AlertHistoryQueryData>(
      ALERT_HISTORY_QUERY,
      { variables: { limit: 20 } },
    );

    useTrackerAlertHistoryBrowseLifecycle(refetch);

    const events = useMemo<AlertHistoryEvent[]>(() => {
      // istanbul ignore next -- `useSuspenseQuery` always resolves data before
      // we render; the `?? []` guard is purely defensive against partial data.
      const wireEvents = data?.alertHistory?.events ?? [];
      return wireEvents.map((e) => ({
        id: e.id,
        brand: e.brand,
        productLine: e.productLine,
        modelName: e.modelName,
        skuDescriptor: e.skuDescriptor,
        // Server only emits `"restocked"` today (INF-1479). INF-1483 will
        // widen the source to include `"soldOut"`. Cast through the shared
        // type so any unknown literal surfaces in TS rather than silently
        // rendering as a misaligned row.
        kind: e.kind as AlertHistoryEventKind,
        detectedAt: e.detectedAt,
      }));
    }, [data?.alertHistory?.events]);

    const onRefresh = useCallback(() => {
      setIsRefreshing(true);
      startTransition(() => {
        void refetch().finally(() => setIsRefreshing(false));
      });
    }, [refetch]);

    const screenState: TrackerAlertHistoryBrowseScreenState =
      events.length > 0 ? "default" : "empty";

    const value: TrackerAlertHistoryBrowseControllersOutput = {
      screenState,
      events,
      isRefreshing,
      onRefresh,
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
